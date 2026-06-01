import type { Announcement, Application, Club, Material } from "../types";

export const clubs: Club[] = [
  {
    id: 1,
    name: "Robotics Lab",
    description: "Build robots, learn sensors, motors, Arduino basics, and teamwork through hands-on challenges.",
    category: "Robotics",
    ageGroup: "10-16",
    teacher: "Aigerim Sadykova",
    schedule: "Mon, Wed 16:00-17:30",
    classroom: "STEM Lab 1",
    availableSeats: 8,
    enrollmentStatus: "open"
  },
  {
    id: 2,
    name: "Python Foundations",
    description: "Programming fundamentals, problem solving, games, and automation with Python.",
    category: "Programming",
    ageGroup: "11-17",
    teacher: "Aigerim Sadykova",
    schedule: "Tue, Thu 15:30-17:00",
    classroom: "Computer Room 2",
    availableSeats: 12,
    enrollmentStatus: "open"
  },
  {
    id: 3,
    name: "Digital Design Studio",
    description: "UI design, visual storytelling, presentation design, and creative portfolio projects.",
    category: "Design",
    ageGroup: "9-15",
    teacher: "Daniyar Omarov",
    schedule: "Sat 10:00-12:00",
    classroom: "Creative Room",
    availableSeats: 4,
    enrollmentStatus: "waitlist"
  },
  {
    id: 4,
    name: "Math Olympiad Prep",
    description: "Logic, patterns, combinatorics, and competition problem solving for advanced students.",
    category: "Mathematics",
    ageGroup: "12-17",
    teacher: "Madina Ilyasova",
    schedule: "Fri 17:00-18:30",
    classroom: "Room 204",
    availableSeats: 0,
    enrollmentStatus: "closed"
  }
];

export const applications: Application[] = [
  {
    id: 1001,
    studentFullName: "Arman Tulegen",
    age: 12,
    contacts: "+7 700 111 2211",
    selectedClub: "Robotics Lab",
    comment: "Interested in Arduino and competitions.",
    status: "new",
    submittedAt: "2026-05-28"
  },
  {
    id: 1002,
    studentFullName: "Amina Rakhim",
    age: 14,
    contacts: "+7 701 444 1199",
    selectedClub: "Python Foundations",
    comment: "Completed Scratch course.",
    status: "pending",
    submittedAt: "2026-05-27"
  },
  {
    id: 1003,
    studentFullName: "Dias Karim",
    age: 10,
    contacts: "+7 777 310 1800",
    selectedClub: "Digital Design Studio",
    comment: "Parent requested Saturday group.",
    status: "approved",
    submittedAt: "2026-05-21"
  },
  {
    id: 1004,
    studentFullName: "Miras Nurlan",
    age: 8,
    contacts: "+7 705 902 6511",
    selectedClub: "Math Olympiad Prep",
    comment: "Too young for current group.",
    status: "rejected",
    submittedAt: "2026-05-18"
  }
];

export const materials: Material[] = [
  {
    id: 201,
    title: "Intro to Robotics Sensors",
    description: "Distance, color, and touch sensors for beginner robotics projects.",
    type: "article",
    club: "Robotics Lab",
    visibility: "Public",
    updatedAt: "2026-05-25"
  },
  {
    id: 202,
    title: "Python Variables Homework",
    description: "Practice numbers, strings, input, and output.",
    type: "homework",
    club: "Python Foundations",
    visibility: "Assigned",
    updatedAt: "2026-05-26"
  },
  {
    id: 203,
    title: "Design Presentation Template",
    description: "Starter deck for student portfolio presentations.",
    type: "presentation",
    club: "Digital Design Studio",
    visibility: "Public",
    updatedAt: "2026-05-20"
  }
];

export const announcements: Announcement[] = [
  {
    id: 301,
    title: "Spring STEM Showcase",
    body: "Students will present robotics, design, and coding projects for parents and guests.",
    type: "event",
    date: "2026-06-08"
  },
  {
    id: 302,
    title: "New Python Group Opens",
    body: "An additional weekday group is available for students aged 11-14.",
    type: "announcement",
    date: "2026-05-31"
  },
  {
    id: 303,
    title: "Robotics Team Wins Regional Prize",
    body: "Digital Urpaq students placed second in the regional robotics challenge.",
    type: "success_story",
    date: "2026-05-19"
  }
];

export const studentSchedule = [
  { day: "Monday", time: "16:00", title: "Robotics Lab", classroom: "STEM Lab 1" },
  { day: "Wednesday", time: "16:00", title: "Robotics Lab", classroom: "STEM Lab 1" },
  { day: "Saturday", time: "10:00", title: "Digital Design Studio", classroom: "Creative Room" }
];
