import React, { useState, useEffect } from "react";
import Sidebar from "./Component/files/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";

function AssignBatch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [questionsDisplay, setQuestionsDisplay] = useState(false);
  const [formData, setFormData] = useState({
    hoursPerDay: "",
    saturdayStudy: "",
    startDate: "",
    sundayHoliday: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://euboardbackend.azurewebsites.net/Content_creation/get_courses/"
      );
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setSelectedCourse(null);
      return;
    }
    const selectedCourseObj = courses.find((course) => course.course_id === selectedValue);
    setSelectedCourse(selectedCourseObj);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleGoButton = async () => {
    if (!questionsDisplay) {
      setQuestionsDisplay(true);
    } else {
      try {
        const payload = { ...formData, course_id: selectedCourse.course_id };
        console.log(payload)
        navigate('/daywise-group', {
          state: {
            data: payload,
          }
        });
      } catch (error) {
        console.error("Error saving batch", error);
      }
    }
  };

  return (
    <div className="container-fluid p-0 mt-3" style={{ maxWidth: "100vw" }}>
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div style={{ marginLeft: isOpen ? "150px" : "60px", transition: "margin-left 0.3s" }}>
        <div className="container-fluid mt-2">
          <div className="d-flex mb-2 justify-content-between align-items-center">
            <button className="btn btn-dark btn-sm" onClick={() => navigate('/dashboard')}>Back</button>
            <h4>Assign Batches</h4><span></span>
          </div>
          <div className="d-flex justify-content-center">
            <label>Select Course Plan:</label>
            <select  style={{ width: "250px" }} className="form-select ms-2 form-select-sm" onChange={handleCourseChange} disabled={questionsDisplay} value={selectedCourse?.course_id || ""}>
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
              ))}
            </select>
            {questionsDisplay?<button className="rounded-2 ms-3" onClick={() => {setQuestionsDisplay(false);}}>Change Course</button>:<button onClick={handleGoButton} className="rounded-2 ms-3" disabled={!selectedCourse} >Go</button>}
            
          </div>

          {questionsDisplay && (
  <div className="card p-3 shadow-sm mt-3 container-md">
    <div className="mb-3">
      <label className="form-label fw-bold">No. of Hours per Day:</label>
      <input
  type="number"
  className="form-control"
  name="hoursPerDay"
  value={formData.hoursPerDay}
  onChange={handleInputChange}
  min="1" 
  max="16"
/>

    </div>
    
    {/* <div className="mb-3">
      <label className="form-label fw-bold">Do you want weekly test?</label>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="weeklyTest" value="Yes" onChange={handleInputChange} />
        <label className="form-check-label">Yes</label>
      </div>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="weeklyTest" value="No" onChange={handleInputChange} />
        <label className="form-check-label">No</label>
      </div>
    </div> */}
    
    <div className="mb-3">
      <label className="form-label fw-bold">Do you want Saturday study day?</label>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="saturdayStudy" value="Yes" onChange={handleInputChange} />
        <label className="form-check-label">Yes</label>
      </div>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="saturdayStudy" value="No" onChange={handleInputChange} />
        <label className="form-check-label">No</label>
      </div>
    </div>
    
    <div className="mb-3">
      <label className="form-label fw-bold">Start Date:</label>
      <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleInputChange} />
    </div>
    
    <div className="mb-3">
      <label className="form-label fw-bold">Do you want Sunday as a holiday?</label>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="sundayHoliday" value="Yes" onChange={handleInputChange} />
        <label className="form-check-label">Yes</label>
      </div>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="sundayHoliday" value="No" onChange={handleInputChange} />
        <label className="form-check-label">No</label>
      </div>
    </div>
    
    <button onClick={handleGoButton} className="btn btn-primary w-100 mt-2" disabled={!Object.values(formData).every(value => value)}>Submit</button>
  </div>
)}

        </div>
      </div>
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(255, 255, 255, 0.8)", zIndex: 9999 }}>
          <PulseLoader size={10} />
        </div>
      )}
    </div>
  );
}

export default AssignBatch;
