
---

# BART Arrival Times and Weather Dashboard

## Project Overview

This project is a web dashboard that displays real-time BART (Bay Area Rapid Transit) arrival times and local weather updates for BART stations. The application is built using HTML, CSS, and Angular, and integrates data from BART and weather APIs. You can change what BART station you want to view live arrival times for by clicking the gear icon in the upper right hand corner. This data is stored as a cookie, so feel free to close the tab and come back to it later!

I built this project since I moved close to a BART station and wanted to know if I need to jog to the station to make the train I needed. The goal is for users to use an old monitor and have it running 24/7.

Here is what it looks like:

![Screenshot](./screenshot.png)

*Note: I did not create the digital art, click the image to see the authors!

## Features

- Real-time BART arrival times for selected stations
- Current and forecasted weather information
- Responsive design for optimal viewing on different devices
- Interactive elements and animations for improved user experience
- Settings button to customize station

## Technologies Used

- **Frontend**: HTML, CSS, Angular
- **APIs**: BART API, Weather API
- **Deployment**: Docker, Kubernetes (planned)
- **Testing**: (planned)

## Setup and Installation

### Prerequisites

- Node.js and npm installed
- Angular CLI installed
- Docker (optional, for containerization)
- Kubernetes (optional, for orchestration)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/FranzKieviet/BART_menu_app.git
    cd bart-weather-dashboard
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the application:
    ```bash
    ng serve
    ```

4. Open your browser and navigate to `http://localhost:4200`.

### Docker Setup (Optional)

1. Build the Docker image:
    ```bash
    docker build -t bart-weather-dashboard .
    ```

2. Run the Docker container:
    ```bash
    docker run -p 80:80 bart-weather-dashboard
    ```

### Kubernetes Setup (Optional)

1. Deploy the application using Kubernetes:
    ```bash
    kubectl apply -f k8s-deployment.yaml
    ```

## Usage

- The dashboard displays the next BART arrivals for El Cerrito del Norte.
- It also shows the current weather and forecast for El Cerrito and San Francisco.
- The settings button in the top right corner allows users to customize their preferences.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## Future Enhancements

- Add Docker and Kubernetes
- Implement automated testing and CI/CD pipeline
- Deploy to a cloud platform

## Contact

For any questions or suggestions, feel free to reach out:

- LinkedIn: [Link](https://www.linkedin.com/in/franz-kieviet/)
- GitHub: [FranzKieviet](https://github.com/FranzKieviet)

---
