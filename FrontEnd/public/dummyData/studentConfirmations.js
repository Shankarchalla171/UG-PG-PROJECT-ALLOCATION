const student_confirmations = [
  {
    "confirmationId": "CONF001",
    "confirmedOn": "2025-02-10",
    "application": {
      "applicationId": "APP002",
      "appliedOn": "2025-02-02",
      "totalApplications": 3,
      "status": "APPROVED",
      "project": {
        "id": "PRJ003",
        "facultyName": "Dr. Pratheek Sharma",
        "projectTitle": "Online Project Allocation Portal",
        "description": "A centralized portal for students to apply, confirm, and get allocated academic projects.",
        "domains": ["Web Development", "Backend Systems"],
        "availableSlots": 1
      }
    }
  },
  {
    "confirmationId": "CONF002",
    "confirmedOn": "2025-02-12",
    "application": {
      "applicationId": "APP005",
      "appliedOn": "2025-02-05",
      "totalApplications": 4,
      "status": "APPROVED",
      "project": {
        "id": "PRJ010",
        "facultyName": "Dr. Manaswin Kumar",
        "projectTitle": "Chatbot for College Enquiries",
        "description": "An AI-powered chatbot to answer student queries related to academics and admissions.",
        "domains": ["Natural Language Processing", "Artificial Intelligence"],
        "availableSlots": 2
      }
    }
  },
  {
    "confirmationId": "CONF003",
    "confirmedOn": "2025-02-14",
    "application": {
      "applicationId": "APP001",
      "appliedOn": "2025-02-01",
      "totalApplications": 5,
      "status": "PENDING",
      "project": {
        "id": "PRJ001",
        "facultyName": "Dr. Gourinath Reddy",
        "projectTitle": "Smart Attendance System",
        "description": "A web-based system that uses QR codes and role-based access to automate classroom attendance.",
        "domains": ["Web Development", "Educational Technology"],
        "availableSlots": 3
      }
    }
  }
]


export default student_confirmations;