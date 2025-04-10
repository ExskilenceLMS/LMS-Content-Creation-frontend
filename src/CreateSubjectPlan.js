import React, { useState, useEffect } from "react";
import Sidebar from "./Component/files/Sidebar";
import axios from "axios";
import { PulseLoader } from "react-spinners";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";

function CreateSubjectPlan() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState({ subject_id: "", subject_name: "" });
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState({ course_id: "", course_name: "", subjects: [] });
  const [subjectPlan, setSubjectPlan] = useState("");
  const [topicLevels, setTopicLevels] = useState(['level1', 'level2', 'level3']);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedsub, setSelectedsub] = useState({ subtopic_id: "", subtopic_name: "" });
  const [showModal, setShowModal] = useState(false);
  const [subTopicData, setSubTopicData] = useState([]);
  const [contentData, setContentData] = useState({});
  const [inputCounts, setInputCounts] = useState({});
  const [selectedItemsData, setSelectedItemsData] = useState({});
  const [selectedMcqCoding, setSelectedMcqCoding] = useState({});
  const [time, setTime] = useState();
  const [modalContent, setModalContent] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [count, setCount] = useState({});
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newSubjectPlan, setNewSubjectPlan] = useState("");
  const [existingData, setExistingData] = useState([]);

  //loading states
  const [fetchContentLoading, setFetchContentLoading] = useState(false);
  const [fetchCountLoading, setFetchCountLoading] = useState(false);
  const [fetchSubTopicLoading, setFetchSubTopicLoading] = useState(false);
  const [fetchSubjectsLoading, setFetchSubjectsLoading] = useState(false);
  const [fetchCourseLoading, setFetchCourseLoading] = useState(false);
  const [fetchTopicLoading, setFetchTopicLoading] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      let calculatedTime = 0;
      Object.keys(selectedItemsData).forEach(key => {
        const data = selectedItemsData[key];
        if (data.files) {
          Object.keys(data.files).forEach(fileKey => {
            calculatedTime += parseInt(data.files[fileKey].time, 10);
          });
        }
        if (data.videos) {
          Object.keys(data.videos).forEach(videoKey => {
            calculatedTime += parseInt(data.videos[videoKey].time, 10);
          });
        }
        if (data.mcq) {
          Object.keys(data.mcq).forEach(level => {
            calculatedTime += data.mcq[level] * 1;
          });
        }
        if (data.coding) {
          Object.keys(data.coding).forEach(level => {
            calculatedTime += data.coding[level] * 15;
          });
        }
      });
      setTime(calculatedTime);
    };
    calculateTime();
  }, [selectedItemsData]);

  useEffect(() => {
    if (existingData.length > 0) {
      const initialSelectedItemsData = {};
      const initialInputCounts = {};

      existingData.forEach(topic => {
        topic.subtopics.forEach(subtopic => {
          const videos = {};
          const files = {};
          subtopic.data.forEach(item => {
            if (item.type === 'video') {
              videos[item.id] = item;
            } else if (item.type === 'file') {
              files[item.id] = item;
            }
          });
          initialSelectedItemsData[subtopic.id] = {
            videos: videos,
            files: files,
            topic: topic.name,
            topicId: topic.id,
            subtopicName: subtopic.subtopicName,
            mcq: subtopic.mcq || {},
            coding: subtopic.coding || {}
          };
          initialInputCounts[subtopic.id] = {
            mcq: subtopic.mcq || {},
            coding: subtopic.coding || {}
          };
        });
      });
      setSelectedItemsData(initialSelectedItemsData);
      setInputCounts(initialInputCounts);
      setSelectedMcqCoding(prev => {
        const newSelectedMcqCoding = { ...prev };
        existingData.forEach(topic => {
          topic.subtopics.forEach(subtopic => {
            newSelectedMcqCoding[subtopic.id] = {
              mcq: Object.values(subtopic.mcq || {}).some(count => count > 0),
              coding: Object.values(subtopic.coding || {}).some(count => count > 0)
            };
          });
        });
        return newSelectedMcqCoding;
      });
    }
  }, [existingData]);

  const handleCheckboxChange = (item, type, subTopic, itemData) => {
    setSelectedItemsData(prev => {
      const newData = { ...prev };

      if (!newData[subTopic.subtopic_id]) {
        newData[subTopic.subtopic_id] = {
          videos: {},
          files: {},
          topic: selectedTopic.name || "",
          topicId: selectedTopic.id || "",
          subtopicName: subTopic.subtopic_name,
          mcq: {},
          coding: {}
        };
      }

      if (type === "mcq" || type === "coding") {
        newData[subTopic.subtopic_id][type] = item ? inputCounts[subTopic.subtopic_id]?.[type] || {} : {};
      } else {
        const collection = type === "video" ? "videos" : "files";
        if (!newData[subTopic.subtopic_id][collection][item]) {
          newData[subTopic.subtopic_id][collection][item] = {
            ...itemData,
          };
        } else {
          const { [item]: removed, ...rest } = newData[subTopic.subtopic_id][collection];
          newData[subTopic.subtopic_id][collection] = rest;
        }
      }

      if (Object.keys(newData[subTopic.subtopic_id].videos).length === 0 &&
        Object.keys(newData[subTopic.subtopic_id].files).length === 0 &&
        Object.keys(newData[subTopic.subtopic_id].mcq).length === 0 &&
        Object.keys(newData[subTopic.subtopic_id].coding).length === 0) {
        delete newData[subTopic.subtopic_id];
      }

      return newData;
    });

    if (type === "mcq" || type === "coding") {
      setSelectedMcqCoding(prev => ({
        ...prev,
        [subTopic.subtopic_id]: {
          ...prev[subTopic.subtopic_id],
          [type]: item
        }
      }));
    }
  };

  const isAllSelected = (subTopicId, videos, files) => {
    if (!videos && !files) return false;
  
    const currentSubTopicData = selectedItemsData[subTopicId] || { videos: {}, files: {} };
    const availableVideos = Object.entries(videos || {}).filter(([_, video]) =>
      topicLevels.includes(video.level) || topicLevels.length === 0
    );
    const availableFiles = Object.entries(files || {}).filter(([_, file]) =>
      topicLevels.includes(file.level) || topicLevels.length === 0
    );
    const selectedVideosCount = Object.entries(currentSubTopicData.videos || {}).filter(([_, video]) =>
      topicLevels.includes(video.level) || topicLevels.length === 0
    ).length;
    const selectedFilesCount = Object.entries(currentSubTopicData.files || {}).filter(([_, file]) =>
      topicLevels.includes(file.level) || topicLevels.length === 0
    ).length;

    const hasAllVideos = selectedVideosCount === availableVideos.length;
    const hasAllFiles = selectedFilesCount === availableFiles.length;

    // const hasAllMcq = Object.keys(currentSubTopicData.mcq).every(level => currentSubTopicData.mcq[level] === maxMcq[level]);
    // const hasAllCoding = Object.keys(currentSubTopicData.coding).every(level => currentSubTopicData.coding[level] === maxCoding[level]);

    return hasAllVideos && hasAllFiles;
  };

  const handleAddNewSubjectPlan = () => {
    setShowAddPlanModal(true);
  };

  const handleSaveNewSubjectPlan = async () => {
    try {
      const response = await axios.post(
        `https://euboardbackend.azurewebsites.net/Content_creation/create_subject_plan/`,
        { courseName: newSubjectPlan }
      );
      if (response.status === 200) {
        setSubjectPlan(newSubjectPlan);
        setShowAddPlanModal(false);
        setNewSubjectPlan("");
        fetchCourses();
      }
    } catch (error) {
      console.error("Error adding new subject plan:", error);
    }
  };

  const handleSelectAllChange = (subTopic, videos, files) => {
    const isCurrentlyAllSelected = isAllSelected(subTopic.subtopic_id, videos, files);
    setSelectedItemsData(prev => {
      const newData = { ...prev };
      if (isCurrentlyAllSelected) {
        delete newData[subTopic.subtopic_id];
      } else {
        newData[subTopic.subtopic_id] = {
          videos: {},
          files: {},
          topic: selectedTopic.name || "",
          topicId: selectedTopic.id || "",
          subtopicName: subTopic.subtopic_name,
          mcq: inputCounts[subTopic.subtopic_id]?.mcq || {},
          coding: inputCounts[subTopic.subtopic_id]?.coding || {}
        };
        if (videos) {
          Object.entries(videos).forEach(([key, value]) => {
            if (topicLevels.includes(value.level) || topicLevels.length === 0) {
              newData[subTopic.subtopic_id].videos[key] = {
                ...value,
              };
            }
          });
        }
        if (files) {
          Object.entries(files).forEach(([key, value]) => {
            if (topicLevels.includes(value.level) || topicLevels.length === 0) {
              newData[subTopic.subtopic_id].files[key] = {
                ...value,
              };
            }
          });
        }
      }
      return newData;
    });
    setSelectedMcqCoding(prev => ({
      ...prev,
      [subTopic.subtopic_id]: {
        mcq: !isCurrentlyAllSelected,
        coding: !isCurrentlyAllSelected
      }
    }));
    setInputCounts(prev => ({
      ...prev,
      [subTopic.subtopic_id]: {
        mcq: !isCurrentlyAllSelected ? inputCounts[subTopic.subtopic_id]?.mcq : {},
        coding: !isCurrentlyAllSelected ? inputCounts[subTopic.subtopic_id]?.coding : {}
      }
    }));
  };
  const handleCountChange = (subTopic, type, level, value) => {
    const maxCount = type === 'mcq' ? calculateMaxMcqCount(subTopic)[level] : calculateMaxCodingCount(subTopic)[level];
    const numValue = Math.min(Math.max(0, parseInt(value) || 0), maxCount);
    const updatedMcqCoding = selectedMcqCoding[subTopic.subtopic_id] || { mcq: {}, coding: {} };
    setInputCounts(prev => ({
      ...prev,
      [subTopic.subtopic_id]: {
        ...prev[subTopic.subtopic_id],
        [type]: {
          ...prev[subTopic.subtopic_id]?.[type], 
          [level]: numValue
        }
      }
    }));
    if (updatedMcqCoding[type]) {
      setSelectedItemsData(prev => ({
        ...prev,
        [subTopic.subtopic_id]: {
          ...prev[subTopic.subtopic_id] || {
            name: subTopic.subtopic_name,
            videos: {},
            files: {},
            topic: selectedTopic.name || "",
            topicId: selectedTopic.id || "",
            mcq: {},
            coding: {}
          },
          [type]: {
            ...prev[subTopic.subtopic_id]?.[type], // Safeguard here as well
            [level]: numValue
          }
        }
      }));
    }
  };
  

  const isItemSelected = (itemKey, type, subTopicId) => {
    return selectedItemsData[subTopicId]?.[type === "video" ? "videos" : "files"]?.[itemKey] !== undefined;
  };

  const handleReorderClick = () => {
    const hasSelectedItems = Object.values(selectedItemsData).some(subtopic =>
      Object.keys(subtopic.videos).length > 0 ||
      Object.keys(subtopic.files).length > 0 ||
      Object.keys(subtopic.mcq).length > 0 ||
      Object.keys(subtopic.coding).length > 0
    );

    if (hasSelectedItems) {
      const filteredData = Object.entries(selectedItemsData).reduce((acc, [subtopicId, data]) => {
        const filteredVideos = Object.entries(data.videos || {}).reduce((videosAcc, [videoId, video]) => {
          if (topicLevels.includes(video.level)) {
            videosAcc[videoId] = video;
          }
          return videosAcc;
        }, {});

        const filteredFiles = Object.entries(data.files || {}).reduce((filesAcc, [fileId, file]) => {
          if (topicLevels.includes(file.level)) {
            filesAcc[fileId] = file;
          }
          return filesAcc;
        }, {});

        const filteredMcq = Object.entries(data.mcq || {}).reduce((mcqAcc, [level, count]) => {
          if (topicLevels.includes(level)) {
            mcqAcc[level] = count;
          }
          return mcqAcc;
        }, {});

        const filteredCoding = Object.entries(data.coding || {}).reduce((codingAcc, [level, count]) => {
          if (topicLevels.includes(level)) {
            codingAcc[level] = count;
          }
          return codingAcc;
        }, {});

        if (Object.keys(filteredVideos).length > 0 || Object.keys(filteredFiles).length > 0 || Object.keys(filteredMcq).length > 0 || Object.keys(filteredCoding).length > 0) {
          acc[subtopicId] = {
            ...data,
            videos: filteredVideos,
            files: filteredFiles,
            mcq: filteredMcq,
            coding: filteredCoding
          };
        }

        return acc;
      }, {});

      const summaryData = Object.entries(filteredData).reduce((acc, [subtopicId, data]) => {
        const topic = topics.find(t => t.topic_id === data.topicId);
        if (!acc[data.topicId]) {
          acc[data.topicId] = {
            id: data.topicId,
            name: data.topic,
            subtopics: []
          };
        }

        const videos = Object.entries(data.videos || {}).map(([videoId, video]) => ({
          id: videoId,
          type: 'video',
          level: video.level,
          path: video.path,
          text: video.text,
          time: video.time
        }));

        const files = Object.entries(data.files || {}).map(([fileId, file]) => ({
          id: fileId,
          type: 'file',
          level: file.level,
          path: file.path,
          text: file.text,
          time: file.time
        }));

        acc[data.topicId].subtopics.push({
          id: subtopicId,
          subtopicName: data.subtopicName,
          videos: videos,
          files: files,
          mcq: data.mcq || {},
          coding: data.coding || {},
        });

        return acc;
      }, {});

      const structuredData = {
        course: selectedCourse,
        subject_id: selectedSubject.subject_id,
        subject_name: selectedSubject.subject_name,
        topics: Object.values(summaryData)
      };

      navigate('/reorder-content', {
        state: {
          selectedItems: structuredData,
          subjectPlan: subjectPlan
        }
      });
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedsub.subtopic_id !== "") {
      setContentData("");
      fetchContent();
      setCount({});
      fetchCount();
    }
  }, [selectedsub]);

  const fetchContent = async () => {
    if (!selectedsub.subtopic_id) return;
    setFetchContentLoading(true);
    try {
      const response = await axios.post(
        `https://euboardbackend.azurewebsites.net/Content_creation/get_content_for_subtopic/`,
        { subtopic_id: selectedsub.subtopic_id }
      );
      if (response.status === 200) {
        const content = response.data;
        const videos = {};
        const files = {};
        content.videos && Object.keys(content.videos).forEach(key => {
          videos[key] = content.videos[key];
        });
        content.files && Object.keys(content.files).forEach(key => {
          files[key] = content.files[key];
        });
        setContentData({ videos, files });
      }
      setFetchContentLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setFetchContentLoading(false);
    }
  };

  const fetchCount = async () => {
    if (!selectedsub.subtopic_id) return;
    setFetchCountLoading(true);
    try {
      const response = await axios.post(
        `https://euboardbackend.azurewebsites.net/Content_creation/get_questions_data_by_subtopic/`,
        { subtopic_id: selectedsub.subtopic_id }
      );
      if (response.status === 200) {
        setCount(response.data);
      }
      setFetchCountLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setFetchCountLoading(false);
    }
  };

  useEffect(() => {
    setTopics([]);
    setSelectedTopic({ id: "", name: "" });
    setSubTopicData([]);
    setSelectedsub({ subtopic_id: "", subtopic_name: "" });
    setContentData({});
    setInputCounts({});
    setSelectedItemsData({});
    setSelectedMcqCoding({});
    setCount({});

    fetchTopics(selectedSubject.subject_id);
  }, [selectedSubject]);

  useEffect(() => {
    setSelectedSubject({ subject_id: "", subject_name: "" });
    setTopics([]);
    setSelectedTopic({ id: "", name: "" });
    setSubTopicData([]);
    setSelectedsub({ subtopic_id: "", subtopic_name: "" });
    setContentData({});
    setInputCounts({});
    setSelectedItemsData({});
    setSelectedMcqCoding({});
    setCount({});
    setExistingData([]);
  }, [selectedCourse]);

  useEffect(() => {
    setContentData("");
    setSelectedsub({ subtopic_id: "", subtopic_name: "" });
    fetchSubTopics(selectedTopic.id);
  }, [selectedTopic]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSubjectClick = async (subject) => {
    if (!subject) {
      setSelectedSubject({ subject_id: "", subject_name: "" });
      return;
    }
    const selectedValue = subject.subject_id;

    const selectedSubjectObj = subjects.find(sub => sub.subject_id === selectedValue);
    setSelectedSubject({
      subject_id: selectedSubjectObj.subject_id,
      subject_name: selectedSubjectObj.subject_name
    });
    const existing = selectedCourse.subjects.includes(subject.subject_id);
    if (existing) {
      const json = {
        course_id: selectedCourse.course_id,
        subject_id: subject.subject_id
      };
      try {
        const response = await axios.post(
          `https://euboardbackend.azurewebsites.net/Content_creation/get_course_subjects/`,
          json
        );
        if (response.status === 200) {
          setExistingData(response.data.topics);
        }
      } catch (error) {
        console.error("Error adding new subject plan:", error);
      }
    }
  };

  const handleCourseChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setSelectedCourse({ course_id: "", course_name: "", subjects: [] });
      return;
    }
    const selectedSubjectObj = courses.find(course => course.course_id === selectedValue);
    if (selectedSubjectObj) {
      setSelectedCourse({
        course_id: selectedSubjectObj.course_id,
        course_name: selectedSubjectObj.course_name,
        subjects: selectedSubjectObj.subjects
      });
    }
  };

  const fetchSubTopics = async (topic) => {
    if (!topic) return;
    try {
      setFetchSubTopicLoading(true);
      const response = await axios.get(
        `https://euboardbackend.azurewebsites.net/Content_creation/sub_topics_data/${topic}`
      );
      setSubTopicData(response.data);
      setFetchSubTopicLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setFetchSubTopicLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setFetchSubjectsLoading(true);
      const response = await axios.get(
        "https://euboardbackend.azurewebsites.net/Content_creation/subjects/"
      );
      setSubjects(response.data);
      setFetchSubjectsLoading(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setFetchSubjectsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setFetchCourseLoading(true);
      const response = await axios.get(
        "https://euboardbackend.azurewebsites.net/Content_creation/get_courses/"
      );
      setCourses(response.data);
      setFetchCourseLoading(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setFetchCourseLoading(false);
    }
  };

  const fetchTopics = async (subjectId) => {
    if (!subjectId) return;
    try {
      setFetchTopicLoading(true);
      const response = await axios.get(
        `https://euboardbackend.azurewebsites.net/Content_creation/topics_by_subject/${subjectId}/`
      );
      setTopics(response.data);
      setFetchTopicLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setFetchTopicLoading(false);
    }
  };

  const toggleTopicContent = (topic) => {
    setSelectedTopic((prevTopic) => (prevTopic.id === topic.topic_id ? { id: "", name: "" } : { id: topic.topic_id, name: topic.topic_name }));
  };

  const toggleSubTopicContent = (subTopic) => {
    setSelectedsub((prev) => {
      const newSelectedSub = prev.subtopic_id === subTopic.subtopic_id
        ? { subtopic_id: "", subtopic_name: "" }
        : { subtopic_id: subTopic.subtopic_id, subtopic_name: subTopic.subtopic_name };

      return newSelectedSub;
    });
  };

  const handleLevelChange = (level) => {
    setTopicLevels((prevLevels) => {
      const currentLevels = prevLevels || [];
      if (currentLevels.includes(level)) {
        return currentLevels.filter(l => l !== level);
      } else {
        return [...currentLevels, level];
      }
    });
  };

  const calculateMaxMcqCount = (subTopic) => {
    const selectedLevels = topicLevels.filter(level => count?.mcq?.[level] !== undefined);
    return selectedLevels.reduce((sum, level) => ({ ...sum, [level]: count?.mcq?.[level] || 0 }), {});
  };

  const calculateMaxCodingCount = (subTopic) => {
    const selectedLevels = topicLevels.filter(level => count?.coding?.[level] !== undefined);
    return selectedLevels.reduce((sum, level) => ({ ...sum, [level]: count?.coding?.[level] || 0 }), {});
  };

  const handlePreviewClick = async (url) => {
    setModalContent(null);
    setModalError(null);
    setShowModal(true);

    if (url.endsWith('.pdf') || url.endsWith('.doc') || url.endsWith('.docx') || url.endsWith('.pptx') || url.endsWith('.ppt')) {
      setModalContent(<iframe src={'https://docs.google.com/gview?url=' + url + '&embedded=true'} width="100%" height="500px" title="Preview" />);
    } else if (url.endsWith('.txt')) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const text = await response.text();
        setModalContent(<pre>{text}</pre>);
      } catch (error) {
        setModalError('Error loading file');
      }
    } else if (url.endsWith('.html') || url.endsWith('.htm')) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const text = await response.text();
        setModalContent(<iframe srcDoc={text} sandbox="allow-same-origin allow-scripts" width="100%" height="500px" title="HTML Preview" style={{ border: 'none' }} />);
      } catch (error) {
        setModalError('Error loading file');
      }
    } else {
      setModalContent(<iframe src={url} width="100%" height="500px" title="Preview" />);
    }
  };

  return (
    <div className="container-fluid p-0 mt-3" style={{ maxWidth: "100vw", overflowX: "hidden", overflowY: "auto" }}>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div style={{ marginLeft: isOpen ? "150px" : "60px", transition: "margin-left 0.3s ease-in" }}>
        <div className="container-fluid">
          <div className="row d-flex mb-2 justify-content-between align-items-center">
            <div className="col d-flex justify-content-between align-items-center">
              <div className="d-flex justify-content-between align-items-center"><label className="ps-1 me-2">Subject Plan :</label>
                <select
                  className="form-select form-select-sm"
                  id="course"
                  onChange={handleCourseChange}
                  value={selectedCourse.course_id || ""}
                  style={{ width: "150px" }}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option
                      key={course.course_id}
                      value={course.course_id}
                    >
                      {course.course_name}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm mx-1" style={{ width: "30px" }} onClick={handleAddNewSubjectPlan}>+</button>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <label className="me-2">Subject</label>
                <select
                  className="form-select form-select-sm"
                  id="subject"
                  value={selectedSubject.subject_id || ""}
                  style={{ width: "150px" }}
                  onChange={(e) => handleSubjectClick(subjects.find(sub => sub.subject_id === e.target.value))}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option
                      key={subject.subject_id}
                      value={subject.subject_id}
                      className={selectedCourse.subjects.includes(subject.subject_id) ? "text-success" : ""}
                      style={{
                        backgroundColor: selectedCourse.subjects.includes(subject.subject_id) ? "#f5f5f5" : "inherit"
                      }}
                    >
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <label className="me-2">Level</label>
                <div className="dropdown">
                  <button
                    className="btn border text-start form-select btn-sm"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ width: "160px" }}
                  >
                    {topicLevels.length > 0 ? topicLevels.join(", ") : "Select Level"}
                  </button>
                  <ul className="dropdown-menu p-0 m-0" aria-labelledby="dropdownMenuButton">
                    <li>
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={topicLevels.includes("level1")}
                          onChange={() => handleLevelChange("level1")}
                          className="me-2"
                        />
                        Level 1
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={topicLevels.includes("level2")}
                          onChange={() => handleLevelChange("level2")}
                          className="me-2"
                        />
                        Level 2
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={topicLevels.includes("level3")}
                          onChange={() => handleLevelChange("level3")}
                          className="me-2"
                        />
                        Level 3
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <label className="me-2">Time : </label>
                <span className="fs-6">
                  {Math.floor(time / 60)} hr {(time % 60).toString().padStart(2, "0")} mins
                </span>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleReorderClick}
                disabled={!Object.values(selectedItemsData).some(
                  (subtopic) =>
                    Object.keys(subtopic.videos).length > 0 ||
                    Object.keys(subtopic.files).length > 0 ||
                    Object.keys(subtopic.mcq).length > 0 ||
                    Object.keys(subtopic.coding).length > 0
                )}
              >
                Reorder
              </button>
            </div>
          </div>
        </div>

        {topics.length > 0 && (
          <div className="mt-3 mx-3 p-2">
            {topics.map((topic) => (
              <div key={topic.topic_id} className="border border-black rounded-2 mb-3">
                <div className="ps-3 fs-5 py-2 d-flex justify-content-between" style={{ backgroundColor: "#F1F2FF" }}>
                  <span>{topic.topic_name}</span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span
                      role="button"
                      className="px-2 me-3"
                      style={{ width: "10px", cursor: "pointer" }}
                      onClick={() => toggleTopicContent(topic)}
                    >
                      {selectedTopic.id === topic.topic_id ? "^" : "v"}
                    </span>
                  </span>
                </div>
                {selectedTopic.id === topic.topic_id && (
                  <div className="mt-2">
                    {subTopicData.length > 0 && selectedTopic.id === topic.topic_id && subTopicData.map((subTopic) => (
                      <div key={subTopic.subtopic_id} className="mx-2 mb-2 border border-black rounded-2">
                        <div className="d-flex justify-content-between align-items-center py-1">
                          <span className="ps-2">
                            {selectedsub.subtopic_id === subTopic.subtopic_id && (
                              <input
  type="checkbox"
  className="me-2"
  checked={isAllSelected(subTopic.subtopic_id, contentData.videos || {}, contentData.files || {})}
  onChange={() => handleSelectAllChange(subTopic, contentData.videos || {}, contentData.files || {})}
/>

                            )}
                            {subTopic.subtopic_name}
                          </span>

                          <div className="d-flex justify-content-between">
                            <div className="px-2 text-center">
                              <span>Videos</span> <br />
                              <span>{subTopic.videos || 0}</span>
                            </div>
                            <div className="px-2 text-center">
                              <span>Notes</span> <br />
                              <span>{subTopic.notes || 0}</span>
                            </div>
                            <div className="px-2 text-center">
                              <span>MCQ</span> <br />
                              <span>{subTopic.mcq || 0}</span>
                            </div>
                            <div className="px-2 text-center">
                              <span>Coding</span> <br />
                              <span>{subTopic.coding || 0}</span>
                            </div>
                            <span role="button" className="me-3" onClick={() => toggleSubTopicContent(subTopic)}>
                              {selectedsub.subtopic_id === subTopic.subtopic_id ? "^" : "v"}
                            </span>
                          </div>
                        </div>

                        {selectedsub.subtopic_id === subTopic.subtopic_id && (
                          <div className="mt-2 p-2">
                            {contentData.videos && Object.keys(contentData.videos).length > 0 && (
                              <>
                                {Object.keys(contentData.videos).map((videoKey) => {
                                  const video = contentData.videos[videoKey];
                                  const level = video.level;
                                  if (topicLevels.includes(level) || topicLevels.length === 0) {
                                    return (
                                      <div key={videoKey} className="d-flex justify-content-between mb-2">
                                        <span>
                                          <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange(videoKey, "video", selectedsub, video)}
                                            checked={isItemSelected(videoKey, "video", selectedsub.subtopic_id)}
                                          />
                                          <strong className="ms-2">{videoKey.toLocaleUpperCase()}</strong> {video.text}
                                        </span>
                                        <span>
                                          <strong className="me-3">{video.time}m</strong>
                                          <button className="border border-none rounded-2" onClick={() => handlePreviewClick(video.url)} style={{ backgroundColor: "#F1F2FF" }}>
                                            Preview
                                          </button>
                                        </span>
                                      </div>
                                    );
                                  }
                                })}
                              </>
                            )}

                            {contentData.files && Object.keys(contentData.files).length > 0 && (
                              <>
                                {Object.keys(contentData.files).map((fileKey) => {
                                  const file = contentData.files[fileKey];
                                  const level = file.level;
                                  if (topicLevels.includes(level) || topicLevels.length === 0) {
                                    return (
                                      <div key={fileKey} className="d-flex justify-content-between mb-2">
                                        <span>
                                          <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange(fileKey, "file", selectedsub, file)}
                                            checked={isItemSelected(fileKey, "file", selectedsub.subtopic_id)}
                                          />
                                          <strong className="ms-2">{fileKey.toLocaleUpperCase()}</strong> {file.text}
                                        </span>
                                        <span>
                                          <strong className="me-3">{file.time}m</strong>
                                          <button className="border border-none rounded-2" onClick={() => handlePreviewClick(file.path)} style={{ backgroundColor: "#F1F2FF" }}>
                                            Preview
                                          </button>
                                        </span>
                                      </div>
                                    );
                                  }
                                })}
                              </>
                            )}
                            <div className="me-4">
                              <input
                                type="checkbox"
                                checked={selectedMcqCoding[subTopic.subtopic_id]?.mcq || false}
                                onChange={(e) => {
                                  handleCheckboxChange(e.target.checked, "mcq", subTopic);
                                }}
                                className="me-2"
                              />
                              <label>MCQ</label>
                              <br />
                              {topicLevels.map(level => (
                                <div key={level}>
                                  <label>{level.toLocaleUpperCase()} :</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={count?.mcq?.[level]}
                                    value={inputCounts[subTopic.subtopic_id]?.mcq?.[level] || 0}
                                    onChange={(e) => handleCountChange(subTopic, "mcq", level, e.target.value)}
                                    className="ms-4"
                                    style={{ width: "60px" }}
                                    disabled={!selectedMcqCoding[subTopic.subtopic_id]?.mcq}
                                  />
                                  <span className="ms-2">/ {count?.mcq?.[level]}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2">
                              <input
                                type="checkbox"
                                checked={selectedMcqCoding[subTopic.subtopic_id]?.coding || false}
                                onChange={(e) => {
                                  handleCheckboxChange(e.target.checked, "coding", subTopic);
                                }}
                                className="me-2"
                              />
                              <label>Coding:</label>
                              <br />
                              {topicLevels.map(level => (
                                <div key={level}>
                                  <label>{level.toLocaleUpperCase()} :</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={count?.coding?.[level]}
                                    value={inputCounts[subTopic.subtopic_id]?.coding?.[level] || 0}
                                    onChange={(e) => handleCountChange(subTopic, "coding", level, e.target.value)}
                                    className="ms-4"
                                    style={{ width: "60px" }}
                                    disabled={!selectedMcqCoding[subTopic.subtopic_id]?.coding}
                                  />
                                  <span className="ms-2">/ {count?.coding?.[level]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <Modal centered show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalError ? (
              <div>{modalError}</div>
            ) : modalContent ? (
              modalContent
            ) : (
              <div>Loading...</div>
            )}
          </Modal.Body>
        </Modal>
      )}

      {showAddPlanModal && (
        <Modal centered show={showAddPlanModal} onHide={() => setShowAddPlanModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Subject Plan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              className="form-control"
              value={newSubjectPlan}
              onChange={(e) => setNewSubjectPlan(e.target.value)}
              placeholder="Enter new subject plan"
            />
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-primary" onClick={handleSaveNewSubjectPlan}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddPlanModal(false)}>
              Cancel
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {(fetchContentLoading || fetchSubjectsLoading || fetchCountLoading || fetchSubTopicLoading || fetchCourseLoading || fetchTopicLoading) && (
        <div className="d-flex justify-content-center align-items-center" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(255, 255, 255, 0.8)", zIndex: 9999 }}>
          <PulseLoader size={10} className="px-2" />
        </div>
      )}
    </div>
  );
}

export default CreateSubjectPlan;