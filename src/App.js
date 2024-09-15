// import logo from './logo.svg';
import "./App.css";

import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

function App() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showFlights, setShowFlights] = useState(false);

  useEffect(() => {

    fetch("/api/getschedule")
      .then((res) => res.json())
      .then((res) => {

        const noOfDays = [...new Set(res.schedule.map((f) => f.day))];
        res.schedule.forEach((s) => (s.capOrder = 20));
        res.schedule.sort((a, b) =>
          a.day > b.day ? 1 : b.day > a.day ? -1 : 0
        );

        setData(res.schedule);
        setDays(noOfDays);
        assignOrders(res.schedule);
        setShowFlights(true);

      });



  }, []);

  const assignOrders = (schedule) => {
    const formOrder = [];
    fetch("/api/getorders")
      .then((res) => res.json())
      .then((res) => {

        for (const [key, value] of Object.entries(res.orders)) {
          const getFlight = assignFlightNo(schedule, value.destination);
          res.orders[key] = {
            ...res.orders[key],
            flightNo: !getFlight?.flight_number ? '' : getFlight?.flight_number,
            arrivalCity: !value.destination ? '' : value.destination,
            day: !getFlight?.day ? '' : getFlight?.day
          };

          formOrder.push({
            orderName: key,
            flightNo: !getFlight?.flight_number ? '' : getFlight?.flight_number,
            arrivalCity: !value.destination ? '' : value.destination,
            day: !getFlight?.day ? '' : getFlight?.day,
            departureCity: !getFlight?.departure_city ? '' : getFlight?.departure_city
          })
        }
        setOrders(formOrder)

      });

  }

  const history = useHistory();

  const toggleWindow = () => {
    setShowFlights(!showFlights)

  }

  const assignFlightNo = (schedule, destination) => {
    const flightIndex = schedule.findIndex(d => d.arrival_city === destination && d.capOrder > 0);
    // if assigning flight 
    const newData = schedule.map((flight, i) => {
      if (i === flightIndex) {
        flight['capOrder'] = flight['capOrder'] - 1;
      }
      return flight;
    });
    setData(newData);
    return schedule[flightIndex];
  }
  const routeChange = (flight_number) => {
    console.log(flight_number, orders)
    setShowFlights(false);
    let path = `/listInfo`;
    history.push(path);
    const filteredOrders = orders.filter(o => o.flightNo === flight_number);
    setOrders(filteredOrders)
  };



  return (
    <div className="wrapper">
      {/* <div className="flex-container"> */}
      <header>
        <h2>Transport.ly </h2>
        <span>An automated air freight scheduling service.</span>
      </header>
      <main>
        <div className="action-button">
          <button type="button" className="btn btn-primary" onClick={() => toggleWindow()}>{showFlights ? 'View Order Button' : 'View Flight Button'}</button>

        </div>


        {!showFlights &&<table className="table border-lb">
            <thead>
              <tr>
                <th scope="col">Order </th>
                <th scope="col">Flight </th>
                <th scope="col">Departure</th>
                <th scope="col">Arrival</th>
                <th scope="col">Day</th>
              </tr>
            </thead>
            <tbody>
              {orders &&
                orders.map(
                  (item, i) =>
                  (
                    <tr key={i}>
                      <td scope="row">{item.orderName}</td>
                      <td>{item.flightNo}</td>
                      <td>{item.departureCity}</td>
                      <td>{item.arrivalCity}</td>
                      <td>
                        {item.day}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
 }

        {showFlights &&
          days &&
          days.map((d) => (
            <div key={d}>
              <div> Day {d}</div>
              <table className="table border-lb ">
                <tbody>
                  <tr>
                    <th>Flight </th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>View Flight</th>
                  </tr>
                  {data &&
                    data.map(
                      (item, i) =>
                        item.day == d && (
                          <tr key={i}>
                            <td>{item.flight_number}</td>
                            <td>{item.departure_city}</td>
                            <td>{item.arrival_city}</td>
                            <td>
                              <button type="button" className="btn btn-primary"  onClick={() => routeChange(item.flight_number)}>
                                View Flight
                              </button>
                            </td>
                          </tr>
                        )
                    )}
                </tbody>
              </table>
            </div>
          ))}
      </main>
    </div>
  );
}

export default App;
