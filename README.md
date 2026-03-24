# Shopping (Next.js + FastAPI)

## Project Overview

This project was created as a combination of two goals: building a simple application for managing shopping lists and maintaining a private sandbox for experimenting with architectural patterns and modern technologies.

It serves both as a practical daily-use tool and a platform for exploring backend–frontend separation, security trade-offs, and potential AI-driven features.

---

## What problem does this solve?

For many people, everyday grocery shopping is a tedious chore they want to get done as quickly as possible. This app was built to optimize and significantly speed up the entire shopping experience.

The core advantage of this solution is real-time list sharing. This allows multiple people to shop simultaneously and independently in different parts of the store while seamlessly tracking items purchased by others. Additionally, the app automatically organizes items by category, reflecting the physical layout of store aisles. This helps users quickly identify what needs to be bought in a specific section, eliminating chaotic store navigation.

Preparing for the trip is also much faster, as you can continuously add missing items to your list anytime, anywhere. This removes the need to write down a long list right before heading out. Furthermore, thanks to its clean design and versatility, the app can easily double as a simple, everyday To-Do list.

---


## Main features

* Google OAuth authentication
* Creating and deleting personal shopping lists
* Sharing lists with other users via email
* Permission management (View Only or Edit access)
* Full item management: adding, editing, deleting, and marking as "bought"
* Live synchronization with automatic updates every 5 seconds
* Screen wake lock using NoSleep.js to prevent the display from dimming while shopping
* Automatic product categorization for faster navigation in-store
* Smart sorting by category with an option to toggle it off
* Manual item reordering using dnd-kit for a smooth drag-and-drop experience

---

## Demo

<div align="center">
  <video src="https://github.com/user-attachments/assets/fe52437f-e240-406b-9dc4-f4711961300e" width="100%"></video>
</div>

## Architecture & Design Decisions

### Decoupled Architecture

The system is designed with a clear separation between frontend and backend layers.

The backend API is implemented independently to leverage Python’s ecosystem, particularly for planned AI-related features such as:

* automatic product categorization,
* advanced data processing,
* potential future recommendation systems.

This separation ensures flexibility, scalability, and the ability to extend backend capabilities without impacting the frontend layer.

---

### Frontend — Next.js

The frontend is built with Next.js due to:

* built-in routing and file-based structure,
* support for Server-Side Rendering (SSR),
* seamless integration of server actions (BFF pattern),
* strong support for modular, component-based architecture via React,
* many out-of-the-box optimizations.

---

### Backend — FastAPI

The backend is implemented using FastAPI, chosen for:

* high performance,
* automatic request validation,
* concise and expressive syntax,
* rich built-in features that reduce boilerplate code.

The API acts as an internal microservice rather than a publicly exposed endpoint.

---

### Data Flow & Communication

The application follows a strict communication pattern:

1. React components render the UI.
2. Data is fetched exclusively via server actions (Backend-for-Frontend layer).
3. Server actions communicate with the FastAPI backend.
4. All API requests are authenticated using a shared secret.

This approach ensures:

* complete isolation of the API from public access,
* reduced attack surface,
* simplified security model.

---

### Security Approach

Given the application's limited scope (household use, ~5 users), the security model prioritizes simplicity without compromising essential safeguards.

Instead of implementing complex authentication mechanisms (e.g., JWT with token rotation, refresh tokens, and blacklisting), a shared-secret-based internal communication model is used.

This significantly reduces implementation complexity while remaining sufficient for the intended use case.

---

### Authentication & User Management

Authentication is handled via NextAuth with Google OAuth (OpenID Connect).

Key design decisions:

* No password-based authentication is implemented.
* Only a predefined list of users is allowed access.
* No user table is stored in the database.
* The application stores only:

  * OpenID user data,
  * internally assigned user identifiers.

This approach minimizes sensitive data handling while leveraging a trusted external identity provider.

---

## Key Takeaways

* Clean separation of concerns (frontend, BFF, backend).
* Security tailored to application scale and context.
* Practical use of modern web technologies.
* Architecture designed with extensibility (AI features) in mind.

---

## Future Improvements

* AI-powered product categorization,
* smarter list suggestions,
* analytics and usage insights,
* potential migration to more advanced authentication if scaling beyond private use.

---
