import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SeatSelection({ flightId: propFlightId, onConfirm, onClose, buttonText = "Continuar al pago", category, maxSeats }) {
  const { flightId: paramFlightId } = useParams();
  const navigate = useNavigate();
  const flightId = propFlightId || paramFlightId;
  const [takenSeats, setTakenSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const api = "http://localhost:5000/api";

  useEffect(() => {
    console.log('selectChair flightId:', flightId);
    const loadTakenSeats = async () => {
      try {
        const res = await fetch(`${api}/flights/${flightId}/seats`);
        const data = await res.json();
        setTakenSeats(data.takenSeats || []);
      } catch (error) {
        console.error('Error fetching taken seats:', error);
        setTakenSeats([]);
      }
    };
    loadTakenSeats();
  }, [flightId]);

  const toggleSeat = seat => {
    if (takenSeats.includes(seat)) return;

    const row = parseInt(seat.slice(0, -1));
    const isBusinessSeat = row <= 3;
    const isEconomySeat = row > 3;

    if (category === 'Business' && !isBusinessSeat) return;
    if (category === 'Economy' && !isEconomySeat) return;

    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      } else if (prev.length < maxSeats) {
        return [...prev, seat];
      }
      return prev;
    });
  };

  const confirmSeats = () => {
    if (onConfirm) {
      onConfirm(selectedSeats);
    } else {
      localStorage.setItem(`selectedSeats_${flightId}`, JSON.stringify(selectedSeats));
      navigate(`/checkout/${flightId}`);
    }
  };

  function SeatMap({ takenSeats, selectedSeats, toggleSeat }) {
    const rows = [];

    for (let row = 1; row <= 26; row++) {
        const isBusiness = row <= 3;
        const seats = ["A", "B", "C", "D", "E", "F"];

        rows.push(
        <div key={row} className="row">
            <span>{row}</span>
            {seats.map(letter => {
            const code = row + letter;
            const isTaken = takenSeats.includes(code);
            const isSelected = selectedSeats.includes(code);

            return (
                <div
                key={code}
                onClick={() => toggleSeat(code)}
                className={`seat 
                    ${isTaken ? "taken" : ""} 
                    ${isSelected ? "selected" : ""} 
                    ${isBusiness ? "business" : "economy"}`}
                >
                {letter}
                </div>
            );
            })}
        </div>
        );
    }

    return <div>{rows}</div>;
    }


  return (
    <div>
      {onClose && <button onClick={onClose}>Close</button>}
      <h1>Select your seats</h1>
      <SeatMap takenSeats={takenSeats} selectedSeats={selectedSeats} toggleSeat={toggleSeat} />
      <button onClick={confirmSeats}>{buttonText}</button>
    </div>
  );
}
