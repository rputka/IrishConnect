/**
 * Mock group/chat data for the IrishConnect student directory application.
 * 
 * IMPORTANT: This is temporary mock data that will be replaced once a database
 * is implemented. This file contains sample chat groups and conversations for
 * the group chat feature. These files should be removed once the backend
 * database system is set up.
 */
export type Group = {
  id: string;
  name: string;
  description: string;
  time: string;
  unread: boolean;
  avatar: string;
};

export const GROUPS: Group[] = [
  { id: "1", name: "The Otters", description: "UFC communitas.", time: "12:14 AM", unread: false, avatar: "TO" },
  { id: "2", name: "Sarah May", description: "Just us.", time: "12:10 AM", unread: false, avatar: "SM" },
  { id: "3", name: "Mom", description: "Family chat.", time: "Yesterday", unread: false, avatar: "M" },
  { id: "4", name: "The Fam", description: "All of us.", time: "Wednesday", unread: false, avatar: "TF" },
  { id: "5", name: "Mom & Dad", description: "Parents.", time: "Tuesday", unread: false, avatar: "MD" },
  { id: "6", name: "70378", description: "KeyBank Alerts.", time: "Monday", unread: false, avatar: "7" },
  { id: "7", name: "Gabe & Pablo", description: "Project chat.", time: "Monday", unread: false, avatar: "GP" },
  { id: "8", name: "Databases", description: "CSE 30240 study group.", time: "Wednesday", unread: false, avatar: "JR" },
  { id: "9", name: "Timmy Putka", description: "Roommates.", time: "Tuesday", unread: false, avatar: "TP" },
  { id: "10", name: "Dan Driscoll", description: "Soccer team.", time: "Monday", unread: false, avatar: "DD" },
  { id: "11", name: "+1 (646) 358-4865", description: "Recruiter.", time: "Monday", unread: false, avatar: "R" },
  { id: "12", name: "35161", description: "Starship notifications.", time: "Monday", unread: false, avatar: "3" },
  { id: "13", name: "Luka Posavec", description: "Stocks.", time: "Monday", unread: false, avatar: "LP" }
];
