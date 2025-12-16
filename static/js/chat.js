(function () {
  const groupList = document.getElementById('group-list');
  const chatPanel = document.getElementById('chat-panel');
  const chatEmpty = document.getElementById('chat-empty');
  const chatTitle = document.getElementById('chat-title');
  const messagesEl = document.getElementById('messages');
  const sendForm = document.getElementById('send-form');
  const addMemberForm = document.getElementById('add-member-form');
  const addMemberResult = document.getElementById('add-member-result');
  const activeGroupIdInput = document.getElementById('active-group-id');
  const activeGroupCreatedByInput = document.getElementById('active-group-created-by');
  const lastTsInput = document.getElementById('last-ts');
  const lastSenderInput = document.getElementById('last-sender');
  const msgInput = document.getElementById('msg-input');
  const deleteBtn = document.getElementById('delete-group-btn');
  const memberSummaryEl = document.getElementById('chat-member-summary');
  const seenKeys = new Set();

  let pollTimer = null;

  function renderMessageIfNew(m) {
    // Use (timestamp, sender) as a unique key
    const key = `${m.ts}|${m.sender}`;
    if (seenKeys.has(key)) return;  // already rendered
    seenKeys.add(key);
    renderMessage(m);
  }

  // fetching
  async function fetchMessages() {
    const gid = activeGroupIdInput.value;
    if (!gid) return;

    const params = new URLSearchParams();
    if (lastTsInput.value) params.set('after_ts', lastTsInput.value);
    if (lastSenderInput.value) params.set('after_sender', lastSenderInput.value);

    const res = await fetch(`/api/group/${encodeURIComponent(gid)}/messages` + (params.toString() ? `?${params}` : ''));
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      for (const m of data) renderMessageIfNew(m);
      const last = data[data.length - 1];
      lastTsInput.value = last.ts;           // e.g., "2025-12-07T18:01:02.000Z"
      lastSenderInput.value = last.sender;   // the sender NDID
    }
  }

  // when switching groups:
  async function setActiveGroup(groupId, groupName, createdBy) {
    activeGroupIdInput.value = String(groupId);
    if (activeGroupCreatedByInput) activeGroupCreatedByInput.value = createdBy || "";
    lastTsInput.value = "";
    lastSenderInput.value = "";
    seenKeys.clear();
    messagesEl.innerHTML = "";
    chatTitle.textContent = `${groupName || `Group ${groupId}`}`;
    chatEmpty.style.display = 'none';
    chatPanel.style.display = 'flex'; // Adjusted for new flex layout

    // highlight active group in sidebar
    if (groupList) {
      groupList.querySelectorAll('.group-item').forEach(btn => btn.classList.remove('active'));
      const activeBtn = groupList.querySelector(`button.group-item[data-group-id="${groupId}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }

    if (deleteBtn) {
      deleteBtn.style.display = (createdBy && window.MY_NDID && createdBy === window.MY_NDID) ? 'inline-flex' : 'none';
    }

    startPolling();
    fetchMessages();

    // load members and build summary
    if (memberSummaryEl) {
      memberSummaryEl.textContent = '';
      memberSummaryEl.classList.remove('has-tooltip');
      memberSummaryEl.removeAttribute('title');
      memberSummaryEl.classList.remove('show-tooltip');
      // remove previous tooltip if any
      while (memberSummaryEl.firstChild) {
        memberSummaryEl.removeChild(memberSummaryEl.firstChild);
      }
      try {
        const res = await fetch(`/api/group/${encodeURIComponent(groupId)}/members`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            const names = data.map(m => m.name || m.ndid);
            // Fit as many names as possible within a reasonable character budget
            const maxChars = 60;
            const visible = [];
            let used = 1; // account for opening paren
            for (let i = 0; i < names.length; i++) {
              const n = names[i];
              const extra = (visible.length ? 2 : 0) + n.length; // ", " + name
              if (used + extra > maxChars) break;
              visible.push(n);
              used += extra;
            }
            const remaining = names.slice(visible.length);
            let summaryText = `(${visible.join(', ')}`;
            if (remaining.length > 0) {
              summaryText += `, `;
              const moreSpan = document.createElement('span');
              moreSpan.className = 'chat-member-more';
              moreSpan.textContent = `+${remaining.length} more`;
              const suffix = document.createTextNode(')');
              // build tooltip anchored to the moreSpan
              const tooltip = document.createElement('div');
              tooltip.className = 'chat-member-tooltip';
              tooltip.innerHTML = remaining.map(n => escapeHtml(n)).join('<br>');
              moreSpan.appendChild(tooltip);

              memberSummaryEl.textContent = summaryText;
              memberSummaryEl.appendChild(moreSpan);
              memberSummaryEl.appendChild(suffix);
              memberSummaryEl.classList.add('has-tooltip');

              moreSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                moreSpan.classList.toggle('show-tooltip');
              });
              // Close tooltip when clicking outside
              document.addEventListener('click', (e) => {
                if (!moreSpan.contains(e.target)) {
                  moreSpan.classList.remove('show-tooltip');
                }
              });
            } else {
              summaryText += ')';
              memberSummaryEl.textContent = summaryText;
            }
          } else {
            memberSummaryEl.textContent = '(No members)';
            memberSummaryEl.removeAttribute('title');
          }
        } else {
          memberSummaryEl.textContent = '(Failed to load members)';
          memberSummaryEl.removeAttribute('title');
        }
      } catch (err) {
        memberSummaryEl.textContent = '(Failed to load members)';
        memberSummaryEl.removeAttribute('title');
      }
    }
  }

  function renderMessage(m) {
    const row = document.createElement('div');
    row.style.margin = '6px 0';
    row.innerHTML = `<strong>${escapeHtml(m.sender_name)}</strong> <small>${new Date(m.ts).toLocaleString()}</small><br>${escapeHtml(m.text)}`;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(fetchMessages, 2000);
  }

  // Sidebar group click
  if (groupList) {
    groupList.addEventListener('click', (e) => {
      const btn = e.target.closest('button.group-item');
      if (!btn) return;
      
      const gid = btn.getAttribute('data-group-id');
      // Retrieve the group name specifically from the .chat-group-name element
      const nameEl = btn.querySelector('.chat-group-name');
      const name = nameEl ? nameEl.textContent.trim() : btn.textContent.trim();
      const createdBy = btn.getAttribute('data-created-by') || "";
      
      setActiveGroup(gid, name, createdBy);
      e.preventDefault();
    });
  }

  // Delete group
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const gid = activeGroupIdInput.value;
      const createdBy = activeGroupCreatedByInput ? activeGroupCreatedByInput.value : "";
      if (!gid || !createdBy || createdBy !== window.MY_NDID) return;
      const ok = confirm('Delete this group? This cannot be undone.');
      if (!ok) return;
      const res = await fetch(`/groupchat/${encodeURIComponent(gid)}/delete`, { method: 'POST' });
      if (res.ok) {
        window.location.href = window.CHAT_URL || '/chat';
      } else {
        alert('Failed to delete group.');
      }
    });
  }

  // Send message
  if (sendForm) {
    sendForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const gid = activeGroupIdInput.value;
      const text = msgInput.value.trim();
      if (!gid || !text) return;
      const form = new FormData();
      form.append('text', text);
      const res = await fetch(`/api/group/${encodeURIComponent(gid)}/messages`, {
        method: 'POST',
        body: form
      });
      if (res.ok) {
        msgInput.value = '';
        fetchMessages(); // immediate refresh
      }
    });
  }

  // Add member
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const gid = activeGroupIdInput.value;
      if (!gid) return;
      const formData = new FormData(addMemberForm);
      const res = await fetch(`/groupchat/${encodeURIComponent(gid)}/add_member`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      addMemberResult.textContent = data?.message || data?.error || (res.ok ? 'Added!' : 'Failed');
      if (res.ok) addMemberForm.reset();
    });
  }

  // Optional: auto-open the group if URL has #group-<id>
  window.addEventListener('load', () => {
    const m = location.hash.match(/group-(\d+)/);
    if (m) {
      const btn = groupList?.querySelector(`button[data-group-id="${m[1]}"]`);
      if (btn) btn.click();
    }
  });
})();
