# API Endpoints

Base URL: `/api`

## Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create student, parent, teacher, or administrator account. In production, administrator creation should be restricted. |
| POST | `/auth/login` | Public | Login with email and password. Returns JWT bearer token. |
| GET | `/auth/me` | Authenticated | Return current user profile. |

## Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | Administrator | List users. |
| GET | `/users/{user_id}` | Administrator | Read user by ID. |
| PATCH | `/users/{user_id}` | Administrator | Update user profile, role, or active status. |

## Clubs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/clubs` | Public | List clubs with optional category filter. |
| GET | `/clubs/{club_id}` | Public | Read club details. |
| POST | `/clubs` | Administrator | Create club. |
| PUT | `/clubs/{club_id}` | Administrator | Update club. |
| DELETE | `/clubs/{club_id}` | Administrator | Delete club. |

## Applications

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/applications` | Student/Parent/Admin | Submit student application. |
| GET | `/applications` | Student/Parent/Teacher/Admin | Student sees own applications, teacher sees applications for assigned clubs, admin sees all. |
| GET | `/applications/{application_id}` | Owner/Teacher/Admin | Read application details. |
| PATCH | `/applications/{application_id}/status` | Administrator | Change status: `new`, `pending`, `approved`, `rejected`. |

## Educational Content

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/content` | Public/Auth | List public or assigned content. |
| GET | `/content/{content_id}` | Public/Auth | Read content. |
| POST | `/content` | Teacher/Admin | Create article, video, presentation, attachment, or homework. |
| PUT | `/content/{content_id}` | Author/Admin | Update content. |
| DELETE | `/content/{content_id}` | Author/Admin | Delete content. |

## News And Announcements

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/announcements` | Public | List published announcements, events, banners, and success stories. |
| POST | `/announcements` | Teacher/Admin | Publish announcement. |
| PUT | `/announcements/{announcement_id}` | Author/Admin | Update announcement. |
| DELETE | `/announcements/{announcement_id}` | Author/Admin | Delete announcement. |

## AI Recommendations

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/ai/recommend` | Public | Recommend clubs from student age, interests, and skills. |

Request:

```json
{
  "age": 12,
  "interests": ["robotics", "programming"],
  "skills": ["logic", "teamwork"]
}
```

Response:

```json
{
  "recommendations": [
    {
      "club_id": 1,
      "club_name": "Robotics Lab",
      "category": "Robotics",
      "score": 92,
      "explanation": "Strong age fit, matching robotics interest, and available seats."
    }
  ]
}
```
