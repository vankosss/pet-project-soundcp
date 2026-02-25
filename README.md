A high-performance, monolithic music streaming platform inspired by SoundCloud, built with a focus on low-level efficiency and modern web standards.

Tech Stack:
Backend: C++ 20, Crow (REST API), libpqxx (PostgreSQL), TagLib (Audio Metadata), nlohmann/json.
Frontend: React 19, Vite, Tailwind CSS, Lucide React, Framer Motion.
Database: PostgreSQL.

1. The main landing page serves as a technical overview of the application. It dynamically fetches and displays the project's metadata, including the author, full-stack composition, integrated libraries, and the monolithic RESTful architecture.

   ![pet_sound_1](https://github.com/user-attachments/assets/3f5500cd-34d9-461b-849e-e5035e2c8e56)

2. Users can explore a centralized repository containing tracks uploaded by the entire community. The interface provides a clean list view of all available songs retrieved directly from the PostgreSQL database, ensuring real-time access to the latest additions.

   ![pet_sound_2](https://github.com/user-attachments/assets/4e1ce82d-9a8c-4cf3-a36d-74c01965ec31)

3. The application features a custom-built audio player designed for seamless streaming. Leveraging C++ on the backend, the player handles high-concurrency requests while the frontend provides a smooth, animated interface for playback control, track selection, and progress tracking.

   ![pet_sound_3](https://github.com/user-attachments/assets/4bd30eb0-e9b8-453e-869b-68d1050cfb0c)

4. The upload module allows users to contribute any audio file to the platform. Multipart Handling: The system processes file uploads using crow::multipart. Metadata Processing: Upon upload, the backend utilizes TagLib to instantly extract metadata such as title, artist, album, and year from the audio file. Persistence: Extracted data is saved to a PostgreSQL table, and the file is stored in a structured filesystem directory for consistent retrieval.

   ![pet_sound_4](https://github.com/user-attachments/assets/1b53353c-b3c6-476a-9752-8e09f12aee7e)
