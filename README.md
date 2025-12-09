# Momentum

Minimal React + Tailwind focus tracker.

Setup (Windows):
1. Open terminal in project folder: cd "c:\Users\sneha\OneDrive\Desktop\samhitha\momentum\momentum"
2. Install: npm install
3. Start dev server: npm run dev
4. Visit http://localhost:5173

Notes:
- Tailwind is configured with class-based dark mode.
- Charts use Recharts (installed as dependency).
- Data persists in localStorage (profiles, tasks, durations, history).

## Features

- **Pomodoro Timer**: Set timers for 25, 50, or 90 minutes with start, pause, and reset functionality. Sound alerts notify users when the timer ends.
- **Task Manager**: Add, edit, and delete tasks. Tasks are persisted in localStorage for easy access across sessions.
- **Focus Summary**: View total focus time and completed sessions with insightful statistics.
- **Dark/Light Mode Toggle**: Easily switch between dark and light themes for a personalized experience.
- **Responsive Design**: The app is fully responsive, providing a seamless experience on both mobile and desktop devices.
- **History Chart**: Visualize daily and weekly focus sessions using Recharts for a graphical representation of productivity.
- **Settings Modal**: Customize timer durations and toggle dark mode in a user-friendly modal interface.

## Installation

To get started with Momentum, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/momentum.git
   ```
2. Navigate to the project directory:
   ```
   cd momentum
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser and go to `http://localhost:3000` to view the app.

## Usage

- Use the Pomodoro timer to manage your work sessions effectively.
- Add tasks to the task manager and track your progress.
- Check the focus summary to see your productivity stats.
- Adjust settings as needed to fit your preferences.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.