graph TB
    subgraph Client["🖥️ Client (React + Redux)"]
        Components["Components (Pages/UI)"]
        Store["Redux Store (Slices)"]
        Router["React Router"]
        Axios["Axios (api.js) + JWT Interceptor"]
    end

    subgraph API["🌐 API Gateway (Express.js)"]
        Middleware["Middleware: JWT Auth · Multer · Validation"]
        AuthRoutes["Auth Routes"]
        EmpRoutes["Employee Routes"]
        TaskRoutes["Task Routes"]
        ReportRoutes["Report Routes"]
    end

    subgraph Controllers["🎮 Controllers"]
        AuthCtrl["Auth Controller"]
        EmpCtrl["Employee Controller"]
        TaskCtrl["Task Controller"]
        ReportCtrl["Report Controller"]
    end

    subgraph Services["⚙️ Services (Business Logic)"]
        Rules["• Password Policy<br/>• Due Date ≥ Start Date<br/>• Completed Task Lock<br/>• Role-based Access<br/>• Notification Triggers"]
    end

    subgraph Repos["📦 Repositories"]
        UserRepo["User Repository"]
        TaskRepo["Task Repository"]
        NotifRepo["Notification Repository"]
    end

    subgraph DAOs["🗄️ DAOs (Sequelize)"]
        UserDAO["User DAO"]
        TaskDAO["Task DAO"]
        NotifDAO["Notification DAO"]
    end

    subgraph DB["📊 Database (MySQL)"]
        Users["Users Table"]
        Tasks["Tasks Table"]
        Notifs["Notifications Table"]
    end

    subgraph External["🔌 External Services"]
        Cron["node-cron<br/>(Due/Overdue Checks)"]
        Uploads["File Storage<br/>(/uploads, 5MB)"]
    end

    Client --> API
    API --> Controllers
    Controllers --> Services
    Services --> Repos
    Repos --> DAOs
    DAOs --> DB
    
    Services --> Cron
    Services --> Uploads

    Users --> Tasks
    Users --> Notifs
    Tasks --> Notifs