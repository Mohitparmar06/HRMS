import { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, Timer, Coffee } from 'lucide-react';

export default function CheckInOutCard({ employeeId, onCheckIn, onCheckOut, isCheckedIn, checkInTime, checkOutTime }) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isCheckedIn || checkOutTime) return;

    const startParts = checkInTime.split(':').map(Number);
    const startMs = (startParts[0] * 3600 + startParts[1] * 60) * 1000;

    const tick = () => {
      const now = new Date();
      const currentMs = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000;
      const diff = currentMs - startMs;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime, checkOutTime]);

  const now = new Date();
  const isLate = checkInTime && (checkInTime > '09:15');

  return (
    <div className="checkinout-card">
      <div className="checkinout-time-display">
        <Timer size={20} className={isCheckedIn && !checkOutTime ? 'spinning' : ''} />
        <span className="checkinout-elapsed">{elapsed}</span>
      </div>

      <div className="checkinout-actions">
        {!isCheckedIn ? (
          <button className="checkin-btn" onClick={() => { onCheckIn(); setPulse(true); setTimeout(() => setPulse(false), 600); }}>
            <LogIn size={20} />
            <span>Check In</span>
          </button>
        ) : !checkOutTime ? (
          <>
            <div className="checkinout-status">
              <Clock size={16} />
              <span>In at {checkInTime}</span>
              {isLate && <span className="late-badge"><Coffee size={12} /> Late</span>}
            </div>
            <button className="checkout-btn" onClick={onCheckOut}>
              <LogOut size={20} />
              <span>Check Out</span>
            </button>
          </>
        ) : (
          <div className="checkinout-done">
            <div className="checkinout-done-row">
              <span className="done-label">Check In</span>
              <span className="done-value">{checkInTime}</span>
            </div>
            <div className="checkinout-done-row">
              <span className="done-label">Check Out</span>
              <span className="done-value">{checkOutTime}</span>
            </div>
          </div>
        )}
      </div>

      {pulse && <div className="checkinout-pulse" />}
    </div>
  );
}
