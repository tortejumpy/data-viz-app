# Data Visualization Application

An interactive data visualization application that enables users to upload Excel files, generate 2D & 3D graphs, and get AI-powered insights.

## Features

- **User Authentication**: Secure login and registration system
- **Data Upload**: Support for Excel files or manual data input
- **Interactive Visualizations**: 2D and 3D charts and graphs
- **AI Insights**: Automatic data analysis with meaningful insights
- **Responsive UI**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js with TypeScript
- Material UI for component styling
- Recharts and Three.js for data visualization
- React Router for routing

### Backend
- Node.js with Express.js
- TypeScript for type safety
- MongoDB for data storage
- JWT for authentication

### AI Service
- Python with FastAPI
- Pandas for data manipulation
- Scikit-learn for machine learning algorithms
- Numpy for numerical computations

## Project Structure

```
data-viz-app/
├── ai-service/         # AI analysis service with Python/FastAPI
├── client/             # React frontend
│   ├── public/         # Static files
│   └── src/            # React components and logic
├── server/             # Node.js Express backend
│   └── src/            # Server code
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB

### Installation and Setup

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/data-viz-app.git
   cd data-viz-app
   ```

2. **Setup the backend server**
   ```
   cd server
   npm install
   cp .env.example .env  # Configure environment variables
   npm run dev
   ```

3. **Setup the frontend client**
   ```
   cd client
   npm install
   npm run dev
   ```

4. **Setup the AI service**
   ```
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

## Usage

1. Register a new account or login
2. Upload an Excel file or manually input data
3. Explore visualizations in the dashboard
4. Generate AI insights to get deeper understanding of your data

## Deployment

Instructions for deploying the application to production environments.

## Contributing

Guidelines for contributing to the project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the open-source libraries that made this project possible. 