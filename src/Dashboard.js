import React, { useRef, useState, useEffect } from "react";
import Sidebar from "./Component/files/Sidebar";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState({
    canScrollLeft: false,
    canScrollRight: true,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

        const canScrollLeft = scrollLeft > 0;
        const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

        setScrollPosition({
          canScrollLeft,
          canScrollRight,
        });
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Ensure the arrows are correct even on first render
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollLeft = () => {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          "https://exskilence-suite-be.azurewebsites.net/Content_creation/dashboard-data/"
        );
        setSubjects(response.data); 
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects(); 
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSubject = (subject) => {
    navigate('/content-creation', { state: { data: subject } });
  };

  return (
    <div className="container-fluid p-0" style={{height:"100vh",maxWidth:"100vw",overflowX:"hidden",overflowY:"auto"}}>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div
        style={{
          marginLeft: isOpen ? "170px" : "80px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div className="d-flex justify-content-between">
          <div className="m-0 mt-2" style={{ color: "#525252" }}>
            <h4 className="mb-4">Subjects</h4>
          </div>
          <div className="text-end pe-2">
            <span
              onClick={scrollLeft}
              className="fs-3"
              style={{
                cursor: "pointer",
                
              }}>
              &lt;
            </span>
            <span
              onClick={scrollRight}
              className="fs-3"
                style={{
                cursor: "pointer",
                
              }}>
              &gt;
            </span>
          </div>
        </div>

        <div
          className="course-container d-flex flex-nowrap"
          ref={scrollContainerRef}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            width: "100%",
          }}
        >
          {subjects.length > 0 ? (
            <>
              {subjects.map((item, index) => (
                <div
                  key={index}
                  value={item}
                  className="shadow rounded-2 mb-2"
                  style={{
                    height: "100px",
                    minWidth: "250px",
                    marginRight: index !== subjects.length - 1 ? "8px" : "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSubject(item)}
                >
                  <h5 className="ps-2">{item.subject_name}</h5>
                  <p className="ps-2">Questions: {item.count.total || 0}</p>
                </div>
              ))}
            </>
          ) : (
            <div className="ps-5 pt-4 mb-3">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
