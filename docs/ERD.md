# Database ERD

```mermaid
erDiagram
  USERS {
    int id PK
    string email UK
    string hashed_password
    string full_name
    string phone
    enum role
    bool is_active
    datetime created_at
  }

  CLUBS {
    int id PK
    string name
    text description
    string category
    int age_min
    int age_max
    int teacher_id FK
    string schedule
    string classroom
    int available_seats
    enum enrollment_status
    datetime created_at
    datetime updated_at
  }

  APPLICATIONS {
    int id PK
    int applicant_id FK
    int club_id FK
    string student_full_name
    int age
    string contacts
    text comment
    enum status
    datetime created_at
    datetime updated_at
  }

  EDUCATIONAL_CONTENT {
    int id PK
    int club_id FK
    int author_id FK
    string title
    text description
    enum content_type
    text body
    string url
    bool is_public
    datetime created_at
    datetime updated_at
  }

  ANNOUNCEMENTS {
    int id PK
    int author_id FK
    string title
    text body
    enum announcement_type
    bool published
    datetime created_at
    datetime updated_at
  }

  USERS ||--o{ CLUBS : teaches
  USERS ||--o{ APPLICATIONS : submits
  CLUBS ||--o{ APPLICATIONS : selected_for
  CLUBS ||--o{ EDUCATIONAL_CONTENT : contains
  USERS ||--o{ EDUCATIONAL_CONTENT : authors
  USERS ||--o{ ANNOUNCEMENTS : publishes
```

## Normalization Notes

- Users are centralized and differentiated by role.
- Clubs reference teachers through `teacher_id`, so teacher assignment is not duplicated.
- Applications reference both applicant user and selected club.
- Educational content belongs to a club and has an author.
- Announcements are separate from educational content because they support banners, events, and success stories.
