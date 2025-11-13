import React, { useState } from "react";

// Helper for month matrix
function getMonthGrid(year, month) {
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const daysInMonth = lastDate.getDate();
  const grid = [];
  let week = [];
  let weekday = firstDate.getDay();
  for (let i = 0; i < weekday; i++) week.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7 || day === daysInMonth) {
      grid.push(week);
      week = [];
    }
  }
  while (week.length && week.length < 7) week.push(null);
  if (week.length) grid.push(week);
  return grid;
}

const monthsList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dateToISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const todayISO = new Date().toISOString().split("T")[0];

function CalendarOverlay({ open, onClose, tasksByDate, onDateClick }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const grid = getMonthGrid(viewYear, viewMonth);

  function getDotColor(dateStr) {
    const tasks = tasksByDate[dateStr];
    if (!tasks || tasks.length === 0) return null;
    if (tasks.some(task =>
      task.status === "pending" && new Date(task.deadline) < new Date(todayISO)
    )) {
      return "#fb2d3b"; // red
    }
    return "#10b981";   // green
  }

  function handleMonthChange(e) { setViewMonth(Number(e.target.value)); }
  function handleYearChange(e) {
    let val = Number(e.target.value);
    if (val >= 2000 && val <= 2100) setViewYear(val);
  }

  return (
    <div
      className="calendar-overlay-modal"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 99998,
        background: "rgba(42,14,104,0.18)",
        width: "100vw",
        height: "100vh",
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="calendar-modal-panel"
        style={{
          background: "#fff",
          borderRadius: 24,
          maxWidth: "680px",
          minWidth: "580px",
          width: "92vw",
          padding: "38px 40px 28px 40px",
          boxShadow: "0 30px 44px #9276ff2a",
          border: "2.4px solid #ece9fa"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with dropdowns */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 28,
            gap: "22px"
          }}
        >
          <button
            style={{
              fontSize: 26,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#7b2ff7",
              padding: "2px 8px",
              borderRadius: "8px",
              transition: ".23s",
            }}
            onClick={() => {
              if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
              } else {
                setViewMonth(viewMonth - 1);
              }
            }}
            aria-label="Prev Month"
          >{"‹"}</button>
          <select
            value={viewMonth}
            onChange={handleMonthChange}
            style={{
              fontSize: "19px",
              fontWeight: 600,
              background: "#f3f3fb",
              borderRadius: "10px",
              padding: "6px 16px",
              color: "#9f67ff",
              border: "1.5px solid #e6e6f3",
              outline: "none"
            }}
          >
            {monthsList.map((m, i) => (
              <option value={i} key={m}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={viewYear}
            onChange={handleYearChange}
            min="2000"
            max="2100"
            style={{
              width: "95px",
              fontWeight: 600,
              fontSize: "19px",
              background: "#f3f3fb",
              borderRadius: "10px",
              padding: "6px 10px",
              color: "#7b2ff7",
              border: "1.5px solid #e6e6f3",
              outline: "none",
              textAlign: "center",
              boxSizing: "border-box",
              letterSpacing: "1px"
            }}
            inputMode="numeric"
            maxLength={4}
          />
          <button
            style={{
              fontSize: 26,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#7b2ff7",
              padding: "2px 8px",
              borderRadius: "8px",
              transition: ".23s",
            }}
            onClick={() => {
              if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(viewYear + 1);
              } else {
                setViewMonth(viewMonth + 1);
              }
            }}
            aria-label="Next Month"
          >{"›"}</button>
        </div>

        {/* Days grid */}
        <table
          style={{
            width: "100%",
            borderSpacing: 0,
            marginBottom: 7,
            tableLayout: "fixed"
          }}
        >
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <th
                  style={{
                    fontWeight: 700,
                    color: "#b294f9",
                    fontSize: "18px",
                    paddingBottom: "13px",
                    letterSpacing: ".05em",
                    textAlign: "center"
                  }}
                  key={d}
                >{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((week, i) => (
              <tr key={i}>
                {week.map((day, j) => {
                  let isToday =
                    day && dateToISO(viewYear, viewMonth, day) === todayISO;
                  let dayISO = day ? dateToISO(viewYear, viewMonth, day) : null;
                  let dotColor = dayISO ? getDotColor(dayISO) : null;
                  return (
                    <td key={j} style={{ padding: "3px" }}>
                      {day ? (
                        <div
                          style={{
                            cursor: "pointer",
                            minWidth: "54px",
                            height: "54px",
                            textAlign: "center",
                            fontWeight: 600,
                            fontSize: "19px",
                            color: isToday ? "#fff" : "#6e37cc",
                            borderRadius: "14px",
                            background: isToday
                              ? "linear-gradient(135deg,#7b2ff7 70%,#b095ff 140%)"
                              : "#f6f6fa",
                            margin: "2px auto",
                            boxShadow: isToday
                              ? "0 3px 16px #a78bfa72"
                              : "0 2px 9px #e7d4fd23",
                            position: "relative",
                            transition: "background .18s",
                          }}
                          onClick={() => onDateClick(dayISO)}
                        >
                          <span>{day}</span>
                          {dotColor && (
                            <span
                              style={{
                                display: "inline-block",
                                width: "13px",
                                height: "13px",
                                background: dotColor,
                                borderRadius: "100%",
                                border: "2px solid #fff",
                                position: "absolute",
                                top: "54%",
                                left: "60%",
                                transform: "translate(-50%,-10%)",
                                boxShadow: "0 2px 7px #44eeca13"
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        ""
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: "right", marginTop: 19 }}>
          <button
            onClick={onClose}
            style={{
              padding: "11px 32px",
              fontWeight: 700,
              background: "#ede9fe",
              color: "#7b2ff7",
              borderRadius: 14,
              border: "0",
              cursor: "pointer",
              fontSize: "18px",
              boxShadow: "0 2px 8px #dfccfd2a",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarOverlay;
