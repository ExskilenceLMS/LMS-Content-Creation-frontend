import React, { useState, useEffect } from "react";
import Sidebar from "./Component/files/Sidebar";
import { PulseLoader } from "react-spinners";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function DayWiseGroup() {
  const [schedule, setSchedule] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedDurations, setSelectedDurations] = useState({});
  const [fetchedJson, setFetchedJson] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const location = useLocation();
  const data = location.state.data;
  const selection = {
    hoursPerDay: data.hoursPerDay,
    saturdayStudyHoliday: data.saturdayStudy,
    startDate: data.startDate,
    sundayHoliday: data.sundayHoliday,
    course_id: data.course_id,
  };

  useEffect(() => {
    const fetchJson = async () => {
      const json = {
        course_id: selection.course_id,
      };
      try {
        const response = await axios.post(
          "https://euboardbackend.azurewebsites.net/Content_creation/get_all_data_of_course/",
          json
        );
        setFetchedJson(response.data);
        const scheduleData = convertToScheduleData(response.data, selection);
        setSchedule(scheduleData);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchJson();
  }, []);

  const setSelectedOption = (value, day) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [day]: value,
    }));
  };

  const setSelectedDuration = (value, day) => {
    setSelectedDurations(prevState => ({
      ...prevState,
      [day]: value,
    }));
  };

  const convertToScheduleData = (selecteddata, course_details) => {
    const schedule = {};
    let currentDay = 0;
    let currentDate = new Date(course_details.startDate);
    const isHoliday = (date) => {
      const dayOfWeek = date.getDay();
      return (dayOfWeek === 6 && course_details.saturdayStudyHoliday === 'Yes') ||
             (dayOfWeek === 0 && course_details.sundayHoliday === 'Yes');
    };
    Object.values(selecteddata).forEach(subjectData => {
      const subjectName = subjectData.subject_name;
      schedule[subjectName] = [];
      let actualTime = 0;
      let daySchedule = null;
      const topics = subjectData.topics || [];
      let isFirstSubtopic = true;
      topics.forEach(topic => {
        const subtopics = topic.subtopics || [];
        subtopics.forEach(subtopic => {
          if (daySchedule === null || isHoliday(currentDate)) {
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: "",
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: course_details.hoursPerDay,
              actualTime: "0.00",
              mcq: { data: [] },
              coding: { data: [] },
              subtopicid: [],
              content: [],
            };
            actualTime = 0;
          }
          const dataDuration = subtopic.data.reduce((acc, item) => acc + parseFloat(item.time), 0) / 60;
          const mcqDuration = (subtopic.mcq?.level1 || 0) * 1 + (subtopic.mcq?.level2 || 0) * 1.5 + (subtopic.mcq?.level3 || 0) * 2;
          const codingDuration = (subtopic.coding?.level1 || 0) * 10 + (subtopic.coding?.level2 || 0) * 20 + (subtopic.coding?.level3 || 0) * 30;
          const mcqCodingDuration = (mcqDuration + codingDuration) / 60;
          const availableTime = parseFloat(course_details.hoursPerDay);
          if (isFirstSubtopic || (actualTime + dataDuration <= availableTime)) {
            daySchedule.topic += (daySchedule.topic ? ", " : "") + `${subtopic.subtopicName} data`;
            daySchedule.subtopicid.push(subtopic.id);
            daySchedule.content.push(...subtopic.data);
            actualTime += dataDuration;
            if (actualTime + mcqCodingDuration <= availableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);
              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: course_details.hoursPerDay,
                actualTime: actualTime.toFixed(2),
                mcq: { data: [] },
                coding: { data: [] },
                subtopicid: [subtopic.id],
                content: [],
              };
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
            }
            isFirstSubtopic = false;
          } else {
            daySchedule.actualTime = actualTime.toFixed(2);
            schedule[subjectName].push(daySchedule);
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            actualTime = dataDuration;
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: `${subtopic.subtopicName} data`,
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: course_details.hoursPerDay,
              actualTime: actualTime.toFixed(2),
              mcq: { data: [] },
              coding: { data: [] },
              subtopicid: [subtopic.id],
              content: [...subtopic.data]
            };
            if (actualTime + mcqCodingDuration <= availableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);
              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: course_details.hoursPerDay,
                actualTime: actualTime.toFixed(2),
                mcq: { data: [] },
                coding: { data: [] },
                subtopicid: [subtopic.id],
                content: [],
              };
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
            }
          }
        });
      });
      if (daySchedule) {
        daySchedule.actualTime = actualTime.toFixed(2);
        schedule[subjectName].push(daySchedule);
      }
    });
    return schedule;
  };

  const handleTimeClick = (selectedDay, hours) => {
    const time = getListOfTime(selectedDay, Number(hours));
    const hey = editScheduleData(fetchedJson, selection, time);
    setSchedule(hey);
  };

  const editScheduleData = (selecteddata, course_details, hoursList) => {
    const schedule = {};
    let currentDay = 0;
    let currentDate = new Date(course_details.startDate);
    const isHoliday = (date) => {
      const dayOfWeek = date.getDay();
      return (dayOfWeek === 6 && course_details.saturdayStudyHoliday === 'Yes') ||
             (dayOfWeek === 0 && course_details.sundayHoliday === 'Yes');
    };
    const getHoursForDay = (day) => {
      const index = day - 1;
      if (index < hoursList.length) {
        return hoursList[index];
      }
      return hoursList.length > 0 ? hoursList[hoursList.length - 1] : 1;
    };
    Object.values(selecteddata).forEach(subjectData => {
      const subjectName = subjectData.subject_name;
      schedule[subjectName] = [];
      let actualTime = 0;
      let daySchedule = null;
      let isFirstSubtopic = true;
      const topics = subjectData.topics || [];
      topics.forEach(topic => {
        const subtopics = topic.subtopics || [];
        subtopics.forEach(subtopic => {
          if (daySchedule === null || isHoliday(currentDate)) {
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            const dayHours = getHoursForDay(currentDay);
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: "",
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: dayHours.toString(),
              actualTime: "0.00",
              mcq: { data: [] },
              coding: { data: [] },
              subtopicid: [],
              content: []
            };
            actualTime = 0;
          }
          const dataDuration = subtopic.data.reduce((acc, item) => acc + parseFloat(item.time), 0) / 60;
          const mcqDuration = (subtopic.mcq?.level1 || 0) * 1 + (subtopic.mcq?.level2 || 0) * 1.5 + (subtopic.mcq?.level3 || 0) * 2;
          const codingDuration = (subtopic.coding?.level1 || 0) * 10 + (subtopic.coding?.level2 || 0) * 20 + (subtopic.coding?.level3 || 0) * 30;
          const mcqCodingDuration = (mcqDuration + codingDuration) / 60;
          const availableTime = parseFloat(daySchedule.duration);
          if (isFirstSubtopic || (actualTime + dataDuration <= availableTime)) {
            daySchedule.topic += (daySchedule.topic ? ", " : "") + `${subtopic.subtopicName} data`;
            daySchedule.subtopicid.push(subtopic.id);
            daySchedule.content.push(...subtopic.data);
            actualTime += dataDuration;
            if (actualTime + mcqCodingDuration <= availableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);
              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              const newDayHours = getHoursForDay(currentDay);
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: newDayHours.toString(),
                actualTime: actualTime.toFixed(2),
                mcq: { data: [] },
                coding: { data: [] },
                subtopicid: [subtopic.id],
                content: [],
              };
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
            }
            isFirstSubtopic = false;
          } else {
            daySchedule.actualTime = actualTime.toFixed(2);
            schedule[subjectName].push(daySchedule);
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (isHoliday(currentDate));
            currentDay++;
            const newDayHours = getHoursForDay(currentDay);
            actualTime = dataDuration;
            daySchedule = {
              day: `Day ${currentDay}`,
              topic: `${subtopic.subtopicName} data`,
              date: currentDate.toISOString().split('T')[0],
              dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              duration: newDayHours.toString(),
              actualTime: actualTime.toFixed(2),
              mcq: { data: [] },
              coding: { data: [] },
              subtopicid: [subtopic.id],
              content: [...subtopic.data]
            };
            const newAvailableTime = parseFloat(daySchedule.duration);
            if (actualTime + mcqCodingDuration <= newAvailableTime) {
              daySchedule.topic += `, ${subtopic.subtopicName} mcq/coding`;
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
              actualTime += mcqCodingDuration;
            } else {
              daySchedule.actualTime = actualTime.toFixed(2);
              schedule[subjectName].push(daySchedule);

              do {
                currentDate.setDate(currentDate.getDate() + 1);
              } while (isHoliday(currentDate));
              currentDay++;
              const nextDayHours = getHoursForDay(currentDay);
              actualTime = mcqCodingDuration;
              daySchedule = {
                day: `Day ${currentDay}`,
                topic: `${subtopic.subtopicName} mcq/coding`,
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                duration: nextDayHours.toString(),
                actualTime: actualTime.toFixed(2),
                mcq: { data: [] },
                coding: { data: [] },
                subtopicid: [subtopic.id],
                content: []
              };
              if (subtopic.mcq) {
                daySchedule.mcq.data.push({ [subtopic.id]: { count: subtopic.mcq } });
              }
              if (subtopic.coding) {
                daySchedule.coding.data.push({ [subtopic.id]: { count: subtopic.coding } });
              }
            }
          }
        });
      });
      if (daySchedule) {
        daySchedule.actualTime = actualTime.toFixed(2);
        schedule[subjectName].push(daySchedule);
      }
    });
    return schedule;
  };

  function getListOfTime(day, inputHours) {
    let ls = [];
    Object.values(schedule).forEach(subject => {
        subject.forEach(entry => {
            if (entry.day === day) {
                let duration = inputHours;
                ls.push(duration);
            } else {
                let duration = parseInt(entry.duration, 10) || 0;
                if (duration > 0) {
                    ls.push(duration);
                }
            }
        });
    });
    return ls;
}

  const handleGoClick = (selectedDay, selectedOption) => {
    if (!selectedOption) return;
    let json = {};
    let flag = false;
    setSchedule(prevSchedule => {
      const updatedSchedule = { ...prevSchedule };
      const subjects = Object.keys(updatedSchedule);
      subjects.forEach(subject => {
        const days = updatedSchedule[subject];
        days.forEach(day => {
          if (!json[subject]) {
            json[subject] = [];
          }
          if (flag) {
            let nextDate = new Date(new Date(day.date).setDate(new Date(day.date).getDate() + 1));
            let nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            while (isHoliday(nextDate)) {
              nextDate = new Date(nextDate.setDate(nextDate.getDate() + 1)); 
              nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            }
            json[subject].push({
              day: `Day ${parseInt(day.day.split(' ')[1]) + 1}`,
              topic: day.topic,
              date: nextDate,
              dayOfWeek: nextDayOfWeek,
              duration: day.duration,
              actualTime: day.actualTime,
              mcq: day.mcq,
              coding: day.coding,
              subtopicid: day.subtopicid,
              content: day.content
            });
          }
          else if (day.day === selectedDay) {
            const local = day;
            flag = true;
            json[subject].push({
              day: selectedDay,
              topic: selectedOption,
              date: day.date,
              dayOfWeek: day.dayOfWeek,
            });
            let nextDate = new Date(new Date(local.date).setDate(new Date(day.date).getDate() + 1));
            let nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            while (isHoliday(nextDate)) {
              nextDate = new Date(nextDate.setDate(nextDate.getDate() + 1)); 
              nextDayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            }
            json[subject].push({
              day: `Day ${parseInt(day.day.split(' ')[1]) + 1}`,
              topic: local.topic,
              date: nextDate,
              dayOfWeek: nextDayOfWeek,
              duration: local.duration,
              actualTime: local.actualTime,
              mcq: local.mcq,
              coding: local.coding,
              subtopicid: local.subtopicid,
              content: local.content
            });
          }
          else {
            json[subject].push({
              day: day.day,
              topic: day.topic,
              date: day.date,
              dayOfWeek: day.dayOfWeek,
              duration: day.duration,
              actualTime: day.actualTime,
              mcq: day.mcq,
              coding: day.coding,
              subtopicid: day.subtopicid,
              content: day.content
            });
          }
        });
      });
      return json;
    });
  };

  const isHoliday = (date) => {
    const dayOfWeek = date.getDay();
    return (dayOfWeek === 6 && selection.saturdayStudyHoliday === 'Yes') ||
           (dayOfWeek === 0 && selection.sundayHoliday === 'Yes');
  };

  const handleSave = async () => {
    setShowModal(true);
  };

  const handleModalOk = async () => {
    try {
      const response = await axios.post('https://euboardbackend.azurewebsites.net/Content_creation/save_daywise/', {
        course_name: name,
        schedule: schedule,
      });
      console.log('Data sent successfully:', response.data);
      setShowModal(false);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <div className="container-fluid p-0 mt-3" style={{ maxWidth: "100vw" }}>
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div style={{ marginLeft: isOpen ? "150px" : "60px", transition: "margin-left 0.3s" }}>

        <div className="container-fluid mt-2">
          <div className="d-flex justify-content-end align-items-end">
            <button onClick={handleSave}>Save</button>
          </div>
          <div className="container-fluid mt-2">
            {Object.keys(schedule).length > 0 ? (
              Object.keys(schedule).map(category => (
                <div key={category}>
                  <h6>{category}</h6>
                  {schedule[category].map((item, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between px-2 py-1 mb-2">
                      <div className="d-flex justify-content-between align-items-start w-100 border border-black mx-2 p-2 rounded-2">
                        <span className="me-3">{item.day}</span>
                        <span style={{ width: "250px" }} className="me-3 text-start">{item.topic}</span>
                        {new Date(item.date).toLocaleDateString('en-US')}
                        <span className="me-3">{item.dayOfWeek}</span>
                        {item.duration ? (
                          <select
                            style={{ width: "60px" }}
                            className="me-3"
                            onChange={(e) => {
                              const newDuration = e.target.value;
                              setSelectedDuration(newDuration, item.day);
                              handleTimeClick(item.day, newDuration); 
                            }}
                            value={selectedDurations[item.day] || item.duration}
                          >
                            {[...Array(10).keys()].map((num) => (
                              <option key={num + 1} value={num + 1}>
                                {num + 1} hrs
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="me-3" style={{ width: "60px" }}></span>
                        )}
                        {item.duration ? <span className="me-3" style={{width:"60px"}}>{item.actualTime} hrs (actual)</span>: <span className="me-3" style={{width:"60px"}}></span>}
                      </div>
                      <div className="d-flex">
                        <select
                          className="mx-2"
                          onChange={(e) => setSelectedOption(e.target.value, item.day)}
                          value={selectedOptions[item.day] || ""}
                        >
                          <option value="">Select any </option>
                          <option>Preparation Day</option>
                          <option>Weekly Test</option>
                          <option>Onsite Workshop</option>
                          <option>Internals</option>
                          <option>Semester Exam</option>
                          <option>Festivals</option>
                          <option>Other</option>
                        </select>
                        <button
    onClick={() => {
      handleGoClick(item.day, selectedOptions[item.day]);
      setSelectedOption("", item.day);  // Clear the selected value after the click
    }}
    className="btn btn-primary"
  >
    Go
  </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No schedule data available.</p>
            )}
          </div>
        </div>

      </div>
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(255, 255, 255, 0.8)", zIndex: 9999 }}>
          <PulseLoader size={10} />
        </div>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Enter Course Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalOk}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DayWiseGroup;