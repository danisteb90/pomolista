import React from "react";
import "./App.css";

const Play = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);
const Pause = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);
const RotateCcw = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v6h6"></path>
    <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
  </svg>
);
const Trash2 = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const CheckCircle = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const SkipForward = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 4 15 12 5 20 5 4"></polygon>
    <line x1="19" y1="5" x2="19" y2="19"></line>
  </svg>
);

// --- Componente principal de la aplicación PomoLista ---

export default function App() {
  // --- CONFIGURACIÓN DEL TEMPORIZADOR (en segundos) ---
  const DURATIONS = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 20 * 60,
  };

  // --- ESTADO DE LA APLICACIÓN ---
  const [tasks, setTasks] = React.useState([]);
  const [newTask, setNewTask] = React.useState("");
  const [newPomodoroTarget, setNewPomodoroTarget] = React.useState(1);
  const [currentTask, setCurrentTask] = React.useState(null);
  const [mode, setMode] = React.useState("work");
  const [timeLeft, setTimeLeft] = React.useState(DURATIONS.work);
  const [isActive, setIsActive] = React.useState(false);
  const [pomodoros, setPomodoros] = React.useState(0);
  const [showWarning, setShowWarning] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [editingTaskId, setEditingTaskId] = React.useState(null);
  const [editingTaskData, setEditingTaskData] = React.useState({
    text: "",
    target: 1,
  });
  const [targetTime, setTargetTime] = React.useState(null); // **NUEVO: Almacena el timestamp de finalización**

  // --- HOOKS PARA EFECTOS SECUNDARIOS ---

  // **MODIFICADO: Hook del temporizador para ser preciso**
  React.useEffect(() => {
    if (!isLoaded) return;

    let interval = null;

    if (isActive && targetTime) {
      interval = setInterval(() => {
        const newTimeLeft = Math.round((targetTime - Date.now()) / 1000);
        if (newTimeLeft <= 0) {
          setTimeLeft(0); // Asegura que el tiempo llegue a 0 antes de procesar el final
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 500); // Se ejecuta más frecuente para mayor precisión visual
    }

    // Lógica para cuando el contador llega a cero
    if (isActive && timeLeft <= 0) {
      playAlarmSound();
      if (mode === "work") {
        const newPomodoroCount = pomodoros + 1;
        setPomodoros(newPomodoroCount);
        if (currentTask) {
          setTasks((prevTasks) =>
            prevTasks.map((task) => {
              if (task.id === currentTask) {
                const newSpent = task.pomodorosSpent + 1;
                const isCompleted = newSpent >= task.pomodorosTarget;
                return {
                  ...task,
                  pomodorosSpent: newSpent,
                  completed: isCompleted,
                };
              }
              return task;
            })
          );
        }
        if (newPomodoroCount % 4 === 0) {
          setMode("longBreak");
          setTimeLeft(DURATIONS.longBreak);
        } else {
          setMode("shortBreak");
          setTimeLeft(DURATIONS.shortBreak);
        }
        setCurrentTask(null);
      } else {
        setMode("work");
        setTimeLeft(DURATIONS.work);
      }
      setIsActive(false);
      setTargetTime(null);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isLoaded, targetTime]);

  React.useEffect(() => {
    if (!isLoaded) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    const taskText = tasks.find((t) => t.id === currentTask)?.text || "Enfoque";
    const modeText =
      mode === "work"
        ? taskText
        : mode === "shortBreak"
        ? "Descanso Corto"
        : "Descanso Largo";
    document.title = `${timeStr} - ${modeText} | PomoLista`;
  }, [timeLeft, mode, currentTask, tasks, isLoaded]);

  // Hook para cargar el estado al iniciar
  React.useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("pomolista_tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));

      const savedTimerState = localStorage.getItem("pomolista_timerState");
      if (savedTimerState) {
        const {
          mode,
          pomodoros,
          currentTask,
          timeLeft: savedTimeLeft,
          isActive,
          targetTime: savedTargetTime,
        } = JSON.parse(savedTimerState);
        setMode(mode);
        setPomodoros(pomodoros);
        setCurrentTask(currentTask);
        setIsActive(isActive);
        setTargetTime(savedTargetTime); // Cargar el targetTime

        if (isActive && savedTargetTime) {
          const newTimeLeft = Math.round((savedTargetTime - Date.now()) / 1000);
          setTimeLeft(Math.max(0, newTimeLeft));
        } else {
          setTimeLeft(savedTimeLeft);
        }
      }
    } catch (error) {
      console.error("Error al cargar el estado:", error);
      localStorage.clear();
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Hook para guardar el estado en el caché
  React.useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("pomolista_tasks", JSON.stringify(tasks));
      const timerState = {
        mode,
        timeLeft,
        isActive,
        pomodoros,
        currentTask,
        targetTime,
      };
      localStorage.setItem("pomolista_timerState", JSON.stringify(timerState));
    } catch (error) {
      console.error("Error al guardar el estado:", error);
    }
  }, [
    tasks,
    mode,
    timeLeft,
    isActive,
    pomodoros,
    currentTask,
    isLoaded,
    targetTime,
  ]);

  // --- MANEJADORES DE EVENTOS ---
  const playAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 1
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (e) {
      console.error("No se pudo reproducir el sonido.", e);
    }
  };

  const handleStartPause = () => {
    if (mode === "work" && !currentTask) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    setShowWarning(false);
    // Si se está iniciando o reanudando
    if (!isActive) {
      setTargetTime(Date.now() + timeLeft * 1000);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTargetTime(null);
    setMode("work");
    setTimeLeft(DURATIONS.work);
    setPomodoros(0);
    setCurrentTask(null);
  };

  const handleSkipBreak = () => {
    setIsActive(false);
    setTargetTime(null);
    setMode("work");
    setTimeLeft(DURATIONS.work);
    setCurrentTask(null);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTask.trim(),
          completed: false,
          pomodorosSpent: 0,
          pomodorosTarget: newPomodoroTarget,
        },
      ]);
      setNewTask("");
      setNewPomodoroTarget(1);
    }
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    if (currentTask === id) {
      handleReset(); // Reiniciar el timer si se borra la tarea actual
    }
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
    handleReset();
  };

  const handleDeleteSeasonedTasks = () => {
    setTasks((prevTasks) => {
      const tasksToKeep = prevTasks.filter((task) => task.pomodorosSpent <= 1);
      if (!tasksToKeep.some((task) => task.id === currentTask)) {
        handleReset();
      }
      return tasksToKeep;
    });
  };

  const handleToggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleSetCurrentTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!isActive && editingTaskId !== id && task && !task.completed) {
      setCurrentTask(id);
      setMode("work");
      setTimeLeft(DURATIONS.work);
      setTargetTime(null);
    }
  };

  const handleStartEditing = (task) => {
    if (!task.completed) {
      setEditingTaskId(task.id);
      setEditingTaskData({ text: task.text, target: task.pomodorosTarget });
    }
  };

  const handleCancelEditing = () => {
    setEditingTaskId(null);
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    setTasks(
      tasks.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              text: editingTaskData.text,
              pomodorosTarget: editingTaskData.target,
            }
          : task
      )
    );
    setEditingTaskId(null);
  };

  // --- CÁLCULOS PARA RENDERIZADO ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const modeConfig = {
    work: {
      label: "Enfoque",
      bgColor: "bg-red-500",
      textColor: "text-red-100",
      borderColor: "border-red-600",
    },
    shortBreak: {
      label: "Descanso Corto",
      bgColor: "bg-blue-500",
      textColor: "text-blue-100",
      borderColor: "border-blue-600",
    },
    longBreak: {
      label: "Descanso Largo",
      bgColor: "bg-green-500",
      textColor: "text-green-100",
      borderColor: "border-green-600",
    },
  };
  const currentConfig = modeConfig[mode];

  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const progressPercentage =
    tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold text-xl">
        Cargando PomoLista...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${currentConfig.bgColor}`}
    >
      <div className="container mx-auto max-w-5xl p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <h1
            className={`text-4xl sm:text-5xl font-bold ${currentConfig.textColor} drop-shadow-md`}
          >
            PomoLista
          </h1>
          <p className={`mt-2 ${currentConfig.textColor} opacity-90`}>
            Enfócate. Descansa. Repite.
          </p>

          <div className="mt-6 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-1">
              <span
                className={`text-sm font-semibold ${currentConfig.textColor}`}
              >
                Progreso del Día
              </span>
              <span className={`text-sm font-bold ${currentConfig.textColor}`}>
                {completedTasksCount} / {tasks.length} Tareas
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 shadow-inner">
              <div
                className="bg-green-400 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
                style={{ width: `${progressPercentage}%` }}
              >
                <span className="text-xs font-bold text-white pr-2">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center w-full">
            <div
              className={`w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all duration-500 bg-white/20 backdrop-blur-sm border ${currentConfig.borderColor}`}
            >
              <p
                className={`text-center text-lg font-semibold ${currentConfig.textColor} mb-4`}
              >
                {currentConfig.label}
              </p>
              <p
                className={`text-7xl sm:text-8xl font-bold text-center ${currentConfig.textColor} tracking-tighter tabular-nums mb-6`}
              >
                {formatTime(timeLeft)}
              </p>
              <div className="flex justify-center space-x-4 items-center">
                <button
                  onClick={handleStartPause}
                  className={`p-4 rounded-full ${currentConfig.textColor} ${currentConfig.bgColor} hover:opacity-90 shadow-lg transition`}
                >
                  {isActive ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className={`p-4 rounded-full ${currentConfig.textColor} bg-white/20 hover:bg-white/30 shadow-lg transition`}
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
                {(mode === "shortBreak" || mode === "longBreak") && (
                  <button
                    onClick={handleSkipBreak}
                    title="Saltar descanso"
                    className={`p-4 rounded-full ${currentConfig.textColor} bg-white/20 hover:bg-white/30 shadow-lg transition`}
                  >
                    <SkipForward className="w-8 h-8" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-6">
              <h3 className={`${currentConfig.textColor} font-semibold mb-2`}>
                Ciclo Actual
              </h3>
              <div className="flex space-x-3">
                {[...Array(4)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-3xl transition-opacity duration-500 ${
                      i < pomodoros % 4 ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    🍅
                  </span>
                ))}
              </div>
            </div>
            {showWarning && (
              <div className="mt-4 p-3 bg-yellow-400 text-yellow-900 rounded-lg text-center font-semibold animate-pulse">
                ¡Selecciona una tarea para empezar!
              </div>
            )}
          </div>

          <div className="w-full bg-white/90 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-700">
                Checklist del Día
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteSeasonedTasks}
                  className="text-xs font-semibold text-orange-600 hover:bg-orange-100 py-1 px-3 rounded-full transition"
                  title="Eliminar tareas con más de 1 Pomodoro"
                >
                  Limpiar veteranas
                </button>
                <button
                  onClick={handleDeleteAllTasks}
                  className="text-xs font-semibold text-red-600 hover:bg-red-100 py-1 px-3 rounded-full transition"
                  title="Eliminar todas las tareas"
                >
                  Limpiar todo
                </button>
              </div>
            </div>
            <form onSubmit={handleAddTask} className="flex mb-4 gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Añadir nueva tarea..."
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />
              <input
                type="number"
                value={newPomodoroTarget}
                onChange={(e) =>
                  setNewPomodoroTarget(Math.max(1, Number(e.target.value)))
                }
                min="1"
                className="w-20 p-3 border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                title="Objetivo de Pomodoros"
              />
              <button
                type="submit"
                className="bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600 transition"
              >
                +
              </button>
            </form>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {tasks.length > 0 ? (
                tasks.map((task) =>
                  editingTaskId === task.id ? (
                    <form
                      key={task.id}
                      onSubmit={handleUpdateTask}
                      className="flex items-center p-3 rounded-lg bg-yellow-100 border-2 border-yellow-500 gap-2"
                    >
                      <span className="mr-3 w-6 h-6 flex-shrink-0"></span>{" "}
                      {/* Espaciador */}
                      <input
                        type="text"
                        value={editingTaskData.text}
                        onChange={(e) =>
                          setEditingTaskData({
                            ...editingTaskData,
                            text: e.target.value,
                          })
                        }
                        autoFocus
                        className="flex-grow bg-white border border-gray-400 rounded px-2 py-1"
                      />
                      <input
                        type="number"
                        min="1"
                        value={editingTaskData.target}
                        onChange={(e) =>
                          setEditingTaskData({
                            ...editingTaskData,
                            target: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="w-16 text-center border border-gray-400 rounded px-2 py-1"
                      />
                      <span className="mr-3">🍅</span>
                      <button
                        type="submit"
                        className="text-xs font-bold py-1 px-2 rounded-full bg-green-500 text-white"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="text-xs font-bold py-1 px-2 rounded-full bg-gray-400 text-white"
                      >
                        X
                      </button>
                    </form>
                  ) : (
                    <div
                      key={task.id}
                      className={`flex items-center p-3 rounded-lg transition-all duration-300 border-2 ${
                        currentTask === task.id
                          ? "bg-red-100 border-red-500"
                          : "bg-gray-100 border-transparent"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mr-3 w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border-2 transition ${
                          task.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-400"
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <span
                        onDoubleClick={() => handleStartEditing(task)}
                        className={`flex-grow cursor-pointer ${
                          task.completed
                            ? "line-through text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {task.text}
                      </span>

                      <div className="ml-auto flex items-center gap-2 text-sm text-gray-600 mr-3">
                        <span
                          className={`font-bold ${
                            task.completed ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {task.pomodorosSpent} / {task.pomodorosTarget}
                        </span>
                        <span>🍅</span>
                      </div>

                      {!task.completed && (
                        <button
                          onClick={() => handleSetCurrentTask(task.id)}
                          className={`text-xs font-bold py-1 px-2 rounded-full transition ${
                            currentTask === task.id
                              ? "bg-red-500 text-white"
                              : "bg-gray-200 text-gray-600 hover:bg-red-200"
                          }`}
                          disabled={isActive || editingTaskId === task.id}
                          title="Enfocarse en esta tarea"
                        >
                          Focus
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="ml-3 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Añade tu primera tarea para empezar el día.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
