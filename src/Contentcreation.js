import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./Component/files/Sidebar";
import Compiler from "./Component/files/Compiler";
import Modal from "./Component/Modals/Modal";
import { useNavigate } from "react-router-dom";
import { FadeLoader, PulseLoader } from "react-spinners";
import DefaultTemplate from "./Component/files/DefaultTemplate";
import SuccessModal from "./Component/Modals/SuccessModal";
import EditedSucModal from "./Component/Modals/EditedSucModal";
import { useLocation } from "react-router-dom";
import HTMLModal from 'react-modal';
function Creator() {
  const [videos, setVideos] = useState([{ path: "", text: "", time: "",level: "level1"  }]);
  const [files, setFiles] = useState([{ file: null, text: "", time: "",level: "level1"  }]);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const data = location.state?.data;
  const sub_id = data?.subject_id|| "";
  const sub_name = data?.subject_name|| "";
  const [count,setCount]=useState(data.count);
  const [explain, setExplain] = useState([]);
  const [showSucModal, setShowSucModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("default");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [currentFile, setCurrentFile] = useState("defaultQn"); 
  const [hints, setHints] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [testCases, setTestCases] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [tags, settags] = useState([]);
  const [mcqtags, setmcqtags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [examples, setExamples] = useState([]);
  const [defaultTemplate, setdefaultTemplate] = useState("");
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [DisplayFiles, setDisplayFiles] = useState([
  ]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [contentType, setContentType] = useState("default");
  const [mcqQuestion, setMCQQuestion] = useState("");
  const [options, setOptions] = useState({
    option1: "",
    option2: "",
    option3: "",
    option4: "",
  });
  const [error, setError] = useState("");
  const [mcqExplanation, setMCQExplanation] = useState("");
  const [selectedSubTopic, setSelectedSubTopic] = useState("");
  const isContentTypeDisabled = !selectedTopic || !selectedSubTopic;
const [SQLTestCases, setSQLTestCases] = useState([])
const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
const [htmlContent, setHtmlContent] = useState("");
const openHTMLModal = () => setIsHtmlModalOpen(true);
const [selectedTemplate, setSelectedTemplate] = useState('1'); 
const closeHTMLModal = () => setIsHtmlModalOpen(false);
// SQL
const [sqldata, setsqlData] = useState({});
  const [sqlerror, setsqlError] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [sqlexplain, setsqlExplain] = useState([]);
  const [sqltags, setsqlTags] = useState([]);
  const [sqlhints, setsqlHints] = useState([]);
  const [sqlquery, setsqlQuery] = useState("");
  const [sqlqn, setsqlQn] = useState("");
  const [sqltable, setTable] = useState("");
  const [isQueryrun, setIsQueryrun] = useState(false);
  const formRef = useRef(null);


  const template = (event) =>{
    setSelectedTemplate(event.target.value);
    handlePreview(event.target.value);   
  }
  useEffect(() => {
    setIsLoading(true);
    const fetchTopics = async () => {
      const json = {
        subject_id: sub_id || '',
      };
      try {
        setIsLoading(true);
        const response = await axios.post(
          "https://exskilence-suite-be.azurewebsites.net/Content_creation/topics_subtopics_by_subject/",
          json
        );
        setTopics(response.data.topics);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchTopics();
    setIsLoading(false);
  }, []);
  useEffect(() => {
    if (currentFile=="defaultQn")
    {
      setCurrentFile("defaultQn");
      refreshOutput();
      setSelectedQuestion("");
      setsqlQuery("");
      setsqlQn("");
      setTable("");
      setsqlTags([]);
      setsqlHints([]);
      setsqlExplain([]);
      setSQLTestCases([]);
      const expectedOpDiv = document.getElementById("expectedop");
  if (expectedOpDiv) {
    expectedOpDiv.innerHTML = "";
 }
    }
  },[currentFile])
  useEffect(() => {
    fetchCount();
    if (sub_name.startsWith("SQL")){
      setIsLoading(true);
      fetch("https://exskilence-suite-be.azurewebsites.net/Content_creation/tables-data/")
      .then((response) => response.json())
      .then((data) => setsqlData(data))
      .catch((error) => console.error("Error fetching data:", error));
      setIsLoading(false);
    }
  }, []);
  const [formData, setFormData] = useState({
    section: "",
    concept: "",
    content: "",
    time: "",
    marks: "",
    question: "",
    tables: "",
    expectedQuery: "",
    options: "Exercise",
    CreatedBy:sessionStorage.getItem("Email"),
  });
  const addSQLExplanation = () => {
    setsqlExplain((prevExplain) => [...prevExplain, ""]);
  };
  const handleSQLExplainChange = (index, value) => {
    setsqlExplain((prevExplain) => {
      const updatedExplain = [...prevExplain];
      updatedExplain[index] = value;
      return updatedExplain;
    });
  };
  const addSQLTags = () => {
    setsqlTags((prevTags) => [...prevTags, ""]);
  };
  const handleSQLTagsChange = (index, value) => {
    setsqlTags((prevTags) => {
      const updatedTags = [...prevTags];
      updatedTags[index] = value;
      return updatedTags;
    });
  };
  const addSQLTestCase = () => {
    setSQLTestCases((prevTestCases) => [...prevTestCases, "" ]);
  };
  const handleSQLTestCaseChange = (index, value) => {
    setSQLTestCases((prevTestCases) => {
      const updatedTestCases = [...prevTestCases];
      updatedTestCases[index] = value; 
      return updatedTestCases;
    });
  };
  const addsqlHint = () => {
    setsqlHints((prevHints) => [...prevHints, ""]);
  };
  const handlesqlHintChange = (index, value) => {
    setsqlHints((prevHints) => {
      const updatedHints = [...prevHints];
      updatedHints[index] = value;
      return updatedHints;
    });
  };
  const selectedOption = formData.options;
  const handleRunClick = () => {
    setIsLoading(true);
    const sqlqueryValue = sqlquery;
    axios
      .post(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/execute-query/",
        { query: sqlqueryValue },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status === 200 && response.data.length > 0) {
          renderoptbl(response.data);
        } else {
          renderNoDataMessage();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        renderNoDataMessage();
      });
    setIsQueryrun(true);
    setIsLoading(false);
  };
  const renderoptbl = (data) => {
    const headers = Object.keys(data[0]);
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      th.style.border = "1px solid black";
      th.style.padding = "8px";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    data.forEach((item) => {
      const row = document.createElement("tr");
      headers.forEach((header) => {
        const td = document.createElement("td");
        td.textContent = item[header] !== undefined ? item[header] : "N/A";
        td.style.border = "1px solid black";
        td.style.padding = "8px";
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    const outputDiv = document.getElementById("expectedop");
    outputDiv.innerHTML = "<h3>Output Table</h3>";
    outputDiv.appendChild(table);
  };
  const renderNoDataMessage = () => {
    const outputDiv = document.getElementById("expectedop");
    outputDiv.innerHTML = "<h3>Output Table</h3><p>No data available</p>";
  };
  const renderTable = (key, tableData) => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      return null;
    }
    const columns = Object.keys(tableData[0]);
    return (
      <div key={key}>
        <h6>{key}</h6>
        <table className="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    let updatedTables = [...selectedTables];
    if (checked) {
      updatedTables.push(value);
    } else {
      updatedTables = updatedTables.filter((table) => table !== value);
    }
    setSelectedTables(updatedTables);
    setTable(updatedTables.join(", "));
  };
  useEffect(() => {
    const tableArray = sqltable.split(", ").filter(Boolean);
    setSelectedTables(tableArray);
  }, [sqltable]);
  const getFormattedData = () => {
    const textAreas = document.querySelectorAll("textarea");
    const formattedExplanations = Array.from(textAreas)
      .filter((textArea) => textArea.id.startsWith("textArea-exp"))
      .map((textArea) => ({
        Explanation: textArea.value,
      }));
    const formattedTags = Array.from(textAreas)
      .filter((textArea) => textArea.id.startsWith("textArea-tag"))
      .map((textArea) => textArea.value.trim());
    const formattedHints = Array.from(textAreas)
      .filter((textArea) => textArea.id.startsWith("textArea-hint"))
      .map((textArea) => ({
        Hint: textArea.value,
      }));
    const formattedTestcase = Array.from(textAreas)
      .filter((textArea) => textArea.id.startsWith("textArea-testcase"))
      .map((textArea) => ({ Testcase: textArea.value.trim() }));
    return {
      Expl: formattedExplanations,
      Hints: formattedHints,
      Tags: formattedTags,
      Testcase: formattedTestcase,
    };
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const createdBy = sessionStorage.getItem("Email");
    if (!isQueryrun) {
      alert("Please run the query once before saving the content");
      return;
    }
    const formattedData = getFormattedData();
    const dataToSubmit = {
      CreatedOn:
        new Date()
          .toISOString()
          .replace("Z", new Date().getTimezoneOffset() <= 0 ? "+" : "-") +
        (new Date().getTimezoneOffset() / 60).toFixed(0).padStart(2, "0") +
        ":" +
        (new Date().getTimezoneOffset() % 60).toString().padStart(2, "0"),
      Level: selectedDifficulty,
      Qn: sqlqn,
      Query: sqlquery,
      CreatedBy: createdBy,
      table: sqltable,
      Expl: formattedData.Expl,
      Hints: formattedData.Hints,
      Tags: formattedData.Tags,
      Testcase: formattedData.Testcase,
    };
    setFormData(dataToSubmit);
  };
  const saveSQL = async () => {
    setIsLoading(true);
    if (!formData) {
      console.error("Form data is not available");
      return;
    }
    const explanationObjects = sqlexplain.map((explanation, index) => ({
      [`Explanation${index + 1}`]: explanation,
    }));
    const hintObjects = sqlhints.map((hint, index) => ({
      [`Hint${index + 1}`]: hint,
    }));
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    const testcaseObjects = sqlhints.map((hint, index) => ({
      [`Testcase${index + 1}`]: hint,
    }));
    let abcjson;
    if (currentFile=="defaultQn"){
    abcjson={
      subtopic_id:selectedSubTopic,
      type: "coding",
      CreatedBy: sessionStorage.getItem("Email"),
      Query:sqlquery,
      level: selectedDifficulty,
      Qn: sqlqn,
      Name: "SQL",
      Table: sqltable,
      Tags: sqltags,
      Hints: hintObjects,
      TestCases: testcaseObjects,
      Explanations: explanationObjects,
      CreatedOn: formattedDate,
      LastUpdated:"",
    }
  
  }
  else if (currentFile!="defaultQn")
  {
    abcjson={
      subtopic_id:selectedSubTopic,
      type: "coding",
      Query:sqlquery,
      level: selectedDifficulty,
      Qn: sqlqn,
      Name: "SQL",
      Table: sqltable,
      Tags: sqltags,
      Hints: hintObjects,
      TestCases: testcaseObjects,
      Explanations: explanationObjects,
      currentFile: currentFile,
      LastUpdated: currentFile ? formattedDate : "",
      Last_Updated_by:sessionStorage.getItem("Email"),
    }
  }
    try {
      const response = await axios.post(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/save/",
        abcjson
      );
      if (response.status === 200) {
        setShowSucModal(true);
        setTimeout(() => {
          setShowSucModal(false);
        }, 2000);
        setsqlQuery("");
        setsqlQn("");
        setTable("");
        setsqlTags([]);
        setsqlHints([]);
        setsqlExplain([]);
        setSQLTestCases([]);
        const expectedOpDiv = document.getElementById("expectedop");
    if (expectedOpDiv) {
      expectedOpDiv.innerHTML = "";
   }
        setdefaultTemplate("");
        setCode1("");
        setCode2("");
        setTestCases([]);
        setKeywords([]);
        settags([]);
        setExplain([]);
        setHints([]);
        setExamples([]);
        setCurrentFile("defaultQn");
        setSelectedDifficulty("default");
        refreshOutput();
        setSelectedQuestion("");
        fetchNameOfFile()
        fetchCount()
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  }
//sql
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const fetchNameOfFile = async () => {
    setIsLoading(true);
    if (contentType === "Content") {
      const json={
        subtopic_id:selectedSubTopic,
      }
      try {
        const response = await axios.post(
          `https://exskilence-suite-be.azurewebsites.net/Content_creation/get_content_for_subtopic/`,
          json
        );
        if (response.status === 200) {
          const videos = Object.values(response.data.videos || [{ path: "", text: "", time: "" ,level: "level1" }]);
          const files = Object.values(response.data.files || [{ file: null, text: "", time: "",level: "level1"  }]);
          setVideos(videos);
          setFiles(files);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } 
    else if (contentType === "MCQ" || contentType === "Coding") {
    const json={
      subtopic_id:selectedSubTopic,
      type:contentType,
    }
    try {
      const response = await axios.post(
        `https://exskilence-suite-be.azurewebsites.net/Content_creation/Questions/`,
        json
      );
      const jsonData = response.data;
      setDisplayFiles(
        jsonData.questions || []
      );
    } catch (error) {
      console.error("Error:", error);
    }
    }
    setIsLoading(false);
    
  };
  const fetchCount = async () => {
    try {
      const response = await axios.get(
        `https://exskilence-suite-be.azurewebsites.net/Content_creation/get_count_of_questions/${sub_id}/`
      );
      if (response.status === 200) {
        setCount(response.data.count);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  useEffect(() => {
    fetchNameOfFile();
  },[contentType,selectedSubTopic]);
  const handleExampleValueChange = (exampleIndex, valueIndex, newValue) => {
    const updatedExamples = [...examples];
    updatedExamples[exampleIndex].Inputs[valueIndex] = newValue;
    setExamples(updatedExamples);
  };
  const handleExampleOutputChange = (exampleIndex, newOutput) => {
    const updatedExamples = [...examples];
    updatedExamples[exampleIndex].Output = newOutput;
    setExamples(updatedExamples);
  };
  const handleExampleExplanationChange = (exampleIndex, newExplanation) => {
    const updatedExamples = [...examples];
    updatedExamples[exampleIndex].Explanation = newExplanation;
    setExamples(updatedExamples);
  };
  const addExampleValue = (exampleIndex) => {
    const updatedExamples = [...examples];
    updatedExamples[exampleIndex].Inputs.push("");
    setExamples(updatedExamples);
  };
  const removeExampleValue = (exampleIndex, valueIndex) => {
    setExamples((prevExamples) => {
      const updatedExamples = [...prevExamples];
      if (updatedExamples[exampleIndex]) {
        const updatedValues = [...updatedExamples[exampleIndex].Inputs];
        updatedValues.splice(valueIndex, 1);
        updatedExamples[exampleIndex] = {
          ...updatedExamples[exampleIndex],
          Inputs: updatedValues,
        };
      }
      return updatedExamples;
    });
  };
  const addExample = () => {
    setExamples([...examples, { Inputs: [""], Output: "", Explanation: "" }]);
  };
  const removeExample = (exampleIndex) => {
    const updatedExamples = examples.filter((_, i) => i !== exampleIndex);
    setExamples(updatedExamples);
  };
  const handleTestCaseValueChange = (testCaseIndex, valueIndex, newValue) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[testCaseIndex].Value[valueIndex] = newValue;
    setTestCases(updatedTestCases);
  };
  const handleTestCaseOutputChange = (testCaseIndex, newOutput) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[testCaseIndex].Output = newOutput;
    setTestCases(updatedTestCases);
  };
  const addTestCaseValue = (testCaseIndex) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[testCaseIndex].Value.push("");
    setTestCases(updatedTestCases);
  };
  const removeTestCaseValue = (testCaseIndex, valueIndex) => {
    setTestCases((prevTestCases) => {
      const updatedTestCases = [...prevTestCases];
      if (updatedTestCases[testCaseIndex]) {
        const updatedValues = [...updatedTestCases[testCaseIndex].Value];
        updatedValues.splice(valueIndex, 1);
        updatedTestCases[testCaseIndex] = {
          ...updatedTestCases[testCaseIndex],
          Value: updatedValues,
        };
      }
      return updatedTestCases;
    });
  };
  const addTestCase = () => {
    setTestCases([...testCases, { Value: [""], Output: "" }]);
  };
  const removeTestCase = (testCaseIndex) => {
    const updatedTestCases = testCases.filter((_, i) => i !== testCaseIndex);
    setTestCases(updatedTestCases);
  };
  const handleKeywordChange = (index, newKeyword) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = newKeyword;
    setKeywords(updatedKeywords);
  };
  const addKeyword = () => {
    setKeywords([...keywords, ""]);
  };
  const handletagChange = (index, newtag) => {
    const updatedtags = [...tags];
    updatedtags[index] = newtag;
    settags(updatedtags);
  };
  const addtag = () => {
    settags([...tags, ""]);
  };
  const handleMCQtagChange = (index, newtag) => {
    const updatedtags = [...mcqtags];
    updatedtags[index] = newtag;
    setmcqtags(updatedtags);
  };
  const addMCQtag = () => {
    setmcqtags([...mcqtags, ""]);
  };
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };
  const refreshOutput = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };
  const openModal = () => {
    if (selectedDifficulty==="default" && (contentType==="MCQ"||contentType==="Coding")) 
      { 
        alert("Please Select Difficulty Level");
      }
      else{
        setIsModalOpen(true);
      }
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name == "question") {
      setMCQQuestion(value);
    } else if (name == "explanation") {
      setMCQExplanation(value);
    } else if (name.startsWith("option")) {
      
      setOptions((prevOptions) => ({
        ...prevOptions,
        [name]: value,
      }));
    } 
  };
  const confirmSave = () => {
    if (contentType === "MCQ") {
      if (currentFile=="defaultQn"){
        handleMCQSubmit();
      }
      else{
        handleMCQUpdate();
      }
    }
     else if (contentType === "Coding") {
      if (currentFile=="defaultQn"){
        if(sub_name.startsWith("Python") || sub_name.startsWith("DSA")){
          saveJson();
        }
        else if (sub_name.startsWith("SQL")){
          saveSQL()
        }
      }
      else{
        if(sub_name.startsWith("Python")|| sub_name.startsWith("DSA")){
          EditJson();
        }
        else if (sub_name.startsWith("SQL")){
          saveSQL()
        }
      }
    } else if (contentType === "Content") {
      handleContentSubmit();
    } 
    setIsModalOpen(false);
  };
  const handleSubTopicChange = (e) => {
    setSelectedSubTopic(e.target.value);
    setdefaultTemplate("");
        setCode1("");
        setCode2("");
        setTestCases([]);
        setKeywords([]);
        settags([]);
        setExplain([]);
        setHints([]);
        setExamples([]);
        refreshOutput();
        setSelectedQuestion("");
        setMCQQuestion("");
        setOptions({
          option1: "",
          option2: "",
          option3: "",
          option4: "",
        });
        setCurrentFile("defaultQn");
        setSelectedDifficulty("default");
        setMCQExplanation("");
        setmcqtags([]);
  };
  const handleTopicChange = (e) => {
    const topicId = e.target.value;
    setSelectedSubTopic("");
    setSelectedTopic(topicId);
    const topic = topics.find((topic) => topic.topic_id === topicId);
    if (topic) {
      setSubTopics(topic.sub_topics);
      setdefaultTemplate("");
        setCode1("");
        setCode2("");
        setTestCases([]);
        setKeywords([]);
        settags([]);
        setExplain([]);
        setHints([]);
        setExamples([]);
        setSelectedDifficulty("default");
        setCurrentFile("defaultQn");
        refreshOutput();
        setSelectedQuestion("");
        setMCQQuestion("");
        setOptions({
          option1: "",
          option2: "",
          option3: "",
          option4: "",
        });
        setMCQExplanation("");

        setmcqtags([]);
    } else {
      setSubTopics([]);
      setdefaultTemplate("");
        setCode1("");
        setCode2("");
        setTestCases([]);
        setKeywords([]);
        settags([]);
        setExplain([]);
        setHints([]);
        setSelectedDifficulty("default");
        setExamples([]);
        refreshOutput();
        setSelectedQuestion("");
        setMCQQuestion("");
        setOptions({
          option1: "",
          option2: "",
          option3: "",
          option4: "",
        });
        setMCQExplanation("");
        setmcqtags([]);
    }
  };
  const handleQuestionChange = async (event) => {
    setCurrentFile(event.target.value);
    setIsLoading(true);
    try {
      if ( event.target.value!=="defaultQn"){
        const json={
          "question_filename":  event.target.value
        }
        const response = await axios.post(
          `https://exskilence-suite-be.azurewebsites.net/Content_creation/get_specific_question/`,
          json
        );
            const jsonData = response.data;
           if (contentType==="Coding"){
            if (sub_name.startsWith("Python")||sub_name.startsWith("DSA")){
              setSelectedQuestion(jsonData.Qn);
              setdefaultTemplate(jsonData.Template);
              setCode1(jsonData.Ans);
              setCode2(jsonData.FunctionCall);
              setTestCases(
                jsonData.TestCases.slice(1).map((tc) => Object.values(tc)[0])
              );
              setKeywords(jsonData.TestCases[0].Testcase);
              settags(jsonData.Tags || []);
              setExamples(jsonData.Examples.map((exam) => Object.values(exam)[0]));
              setExplain(jsonData.Explanations.map((ex) => Object.values(ex)[0]));
              setHints(jsonData.Hints.map((hint) => Object.values(hint)[0]));
            }
            else if (sub_name.startsWith("SQL")){
              settags(jsonData.Tags || []);
              setSelectedQuestion(jsonData.Qn);
              setsqlQuery(jsonData.Query);
              setsqlQn(jsonData.Qn);
              setTable(jsonData.Table);
              setsqlTags(jsonData.Tags || []);
              setsqlHints(jsonData.Hints.map((ex) => Object.values(ex)[0]));
              setsqlExplain(jsonData.Explanations? jsonData.Explanations.map((ex) => Object.values(ex)[0]) : jsonData.Expl.map((ex) => Object.values(ex)[0]));
              const split= jsonData.TestCases.slice(0, -1)
              setSQLTestCases(split.map((hint) => Object.values(hint)[0]));
            }
           }
           else if (contentType==="MCQ"){
            setMCQQuestion(jsonData.question);
            setOptions({
              option1: jsonData.options[0],
              option2: jsonData.options[1],
              option3: jsonData.options[2],
              option4:  jsonData.options[3],
            });
            setmcqtags(jsonData.Tags);
            const li=jsonData.options
              
            setMCQExplanation(jsonData.Explanation);
        setSelectedTemplate(jsonData.Template);
           }
            setSelectedDifficulty(jsonData.Level? jsonData.Level: jsonData.level? jsonData.level:"level3");
            console.log('hello')
      }
     else{
      if(contentType==="MCQ"){
        setMCQQuestion("");
        setOptions({
          option1: "",
          option2: "",
          option3: "",
          option4: "",
        });
        setMCQExplanation("");
        setmcqtags([]);
      }
      if (contentType==="Coding")
      {
        setdefaultTemplate("");
        setCode1("");
        setCode2("");
        setTestCases([]);
        setKeywords([]);
        settags([]);
        setExplain([]);
        setHints([]);
        setExamples([]);
        refreshOutput();
        setSelectedQuestion("");
      }
      setSelectedDifficulty("default");
     }
        } catch (error) {
          console.error("Error fetching file content:", error);
          setSelectedQuestion("");
          setdefaultTemplate("");
          setCode1("");
          setCode2("");
          setTestCases([]);
          setKeywords([]);
          settags([]);
          setExamples([]);
          setExplain([]);
          setHints([]);
          setSelectedDifficulty("");
        }
        setIsLoading(false);
  };
  const handleRadioChangeDiff = (event) => {
    setSelectedDifficulty(event.target.value);
    setsqlQuery("");
      setsqlQn("");
      setTable("");
      setsqlTags([]);
      setsqlHints([]);
      setsqlExplain([]);
      setSQLTestCases([]);
      refreshOutput();
      const expectedOpDiv = document.getElementById("expectedop");
  if (expectedOpDiv) {
    expectedOpDiv.innerHTML = "";
 }
  };
  const handleContentTypeChange = (e) => {
    setContentType(e.target.value);
    setCurrentFile("defaultQn")
  };
  const addExplanation = () => {
    setExplain((prevExplain) => [...prevExplain, ""]);
  };
  const handleExplainChange = (index, value) => {
    setExplain((prevExplain) => {
      const updatedExplain = [...prevExplain];
      updatedExplain[index] = value;
      return updatedExplain;
    });
  };
  const addHint = () => {
    setHints((prevHints) => [...prevHints, ""]);
  };
  const handleHintChange = (index, value) => {
    setHints((prevHints) => {
      const updatedHints = [...prevHints];
      updatedHints[index] = value;
      return updatedHints;
    });
  };
  const saveJson = async () => {
    setIsLoading(true);
    const question = document.querySelector("#que").value;
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    const createdBy = sessionStorage.getItem("Email");
    const testCaseObjects = [
      { Testcase: keywords },
      ...testCases.map((testCase, index) => ({ [`Testcase`]: testCase })),
    ];
    const explanationObjects = explain.map((explanation, index) => ({
      [`Explanation${index + 1}`]: explanation,
    }));
    const hintObjects = hints.map((hint, index) => ({
      [`Hint${index + 1}`]: hint,
    }));
    const exObjects = examples.map((example, index) => ({
      [`Example`]: example,
    }));
    const jsonObject = {
      subtopic_id: selectedSubTopic,
      level: selectedDifficulty,
      type: "coding",
      Name: "Python",
      QNty: "PY",
      CreatedON: formattedDate,
      QnTy: "code",
      MultiSelect: "0",
      QnTe: "MC9.htm",
      CreatedBy: createdBy,
      Tags: tags,
      Qn: question,
      Template: defaultTemplate,
      Examples: exObjects,
      Ans: code1,
      FunctionCall: code2,
      TestCases: testCaseObjects,
      Explanations: explanationObjects,
      Hints: hintObjects,
      LastUpdated:  "",
      Query: "",
      Table: "",
    };
    try {
      const response = await axios.post(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/course-plan/",
        jsonObject
      );
      if (response.status === 200) {
        setShowSucModal(true);
        setTimeout(() => {
          setShowSucModal(false);
        }, 2000);
        setdefaultTemplate("");
        setCode1("");
        setCode2("");
        setTestCases([]);
        setKeywords([]);
        settags([]);
        setExplain([]);
        setHints([]);
        setExamples([]);
        setCurrentFile("defaultQn");
        refreshOutput();
        setSelectedQuestion("");
        fetchNameOfFile()
        fetchCount()
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };
  const EditJson = async () => {
    setIsLoading(true);
    const question = document.querySelector("#que").value;
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    const createdBy = sessionStorage.getItem("Email");
    const testCaseObjects = [
      { Testcase: keywords },
      ...testCases.map((testCase, index) => ({ [`Testcase`]: testCase })),
    ];
    const explanationObjects = explain.map((explanation, index) => ({
      [`Explanation${index + 1}`]: explanation,
    }));
    const hintObjects = hints.map((hint, index) => ({
      [`Hint${index + 1}`]: hint,
    }));
    const exObjects = examples.map((example, index) => ({
      [`Example`]: example,
    }));
    const jsonObject = {
      subtopic_id: selectedSubTopic,
      level: selectedDifficulty,
      type: "coding",
      Name: "Python",
      QNty: "PY",
      QnTy: "code",
      MultiSelect: "0",
      QnTe: "MC9.htm",
      Tags: tags,
      Qn: question,
      Template: defaultTemplate,
      Examples: exObjects,
      Ans: code1,
      FunctionCall: code2,
      TestCases: testCaseObjects,
      Explanations: explanationObjects,
      Hints: hintObjects,
      currentFile: currentFile,
      LastUpdated: currentFile ? formattedDate : "",
      Last_Updated_by:sessionStorage.getItem("Email"),
      Query: "",
      Table: "",
    };
    try {
      const response = await axios.post(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/course-plan/",
        jsonObject
      );
      if (response.status === 200) {
        setShowSucModal(true);
        setTimeout(() => {
          setShowSucModal(false);
        }, 2000);
        setdefaultTemplate("");
        setCode1("");
        setCode2("");
        setTestCases([]);
        setKeywords([]);
        settags([]);
        setExplain([]);
        setHints([]);
        setExamples([]);
        refreshOutput();
        setSelectedQuestion("defaultQn");
        setCurrentFile("defaultQn");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };
  const addVideoInput = () => {
    setVideos([...videos, { path: "", text: "", time:"",level: "level1" }]);
  };
  const addFileInput = () => {
    setFiles([...files, { file: null, text: "", time:"",level: "level1"  }]);
  };
  const handleVideoUrlChange = (e, index) => {
    const updatedVideos = [...videos];
    updatedVideos[index].path = e.target.value;
    setVideos(updatedVideos);
  };
  const handleVideoDescriptionChange = (e, index) => {
    const updatedVideos = [...videos];
    updatedVideos[index].text = e.target.value;
    setVideos(updatedVideos);
  };
  const handleVideoTimeChange = (e, index) => {
    const updatedVideos = [...videos];
    updatedVideos[index].time = e.target.value;
    setVideos(updatedVideos);
  };
  const handleVideoLevelChange = (e, index) => {
    const updatedVideos = [...videos];
    updatedVideos[index].level = e.target.value;
    setVideos(updatedVideos);
  };
  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    const validTypes = [
      'text/plain', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/html', 
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB file size limit
  
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Only .txt, .pdf, .doc, .docx, .ppt, .pptx, .html are allowed.");
      return;
    }
    if (file.size > maxSize) {
      setError("File size is too large. Maximum allowed size is 5MB.");
      return;
    }
  
    const updatedFiles = [...files];
    updatedFiles[index].file = file;
    setFiles(updatedFiles);
  };
  const handleFileDescriptionChange = (e, index) => {
    const updatedFiles = [...files];
    updatedFiles[index].text = e.target.value;
    setFiles(updatedFiles);
  };
  const handleFileTimeChange = (e, index) => {
    const updatedFiles = [...files];
    updatedFiles[index].time = e.target.value;
    setFiles(updatedFiles);
  };
  const handleFileLevelChange = (e, index) => {
    const updatedFiles = [...files];
    updatedFiles[index].level = e.target.value;
    setFiles(updatedFiles);
  };
  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, idx) => idx !== index);
    setVideos(updatedVideos);
  };
  const removeFile = (index) => {
    const updatedFiles = files.filter((_, idx) => idx !== index);
    setFiles(updatedFiles);
  };
  const handleContentSubmit = async () => {
    if (videos.length === 0 || files.length === 0) {
      setError("At least one video and one file are required!");
      return;
    }
    const formData = new FormData();
    formData.append("subtopic_id", selectedSubTopic);
    formData.append("type", "content");
    videos.forEach((video, index) => {
      formData.append(`videos[video${index + 1}][path]`, video.path);
      formData.append(`videos[video${index + 1}][time]`, video.time);
      formData.append(`videos[video${index + 1}][text]`, video.text);
      formData.append(`videos[video${index + 1}][level]`, video.level);
    });
    files.forEach((file, index) => {
      if (file.file) {
        formData.append(`files[file${index + 1}][file]`, file.file);
      }
      else if (file.path) {
        formData.append(`files[file${index + 1}][path]`, file.path)
      }
      formData.append(`files[file${index + 1}][text]`, file.text);
      formData.append(`files[file${index + 1}][time]`, file.time);
      formData.append(`files[file${index + 1}][level]`, file.level);
    });    
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/content/",
        formData
      );
      setError("");
    } catch (error) {
      console.error("Error:", error);
      setError("There was an issue submitting the content.");
    }
    setIsLoading(false);
  };
  const handleMCQSubmit = async () => {
    setIsLoading(true);
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    const mcqData = {
      subtopic_id: selectedSubTopic,
      level: selectedDifficulty,
      CreatedBy: sessionStorage.getItem("Email"),
      type: "mcq",
      question: mcqQuestion,
      options: [
        options.option1,
        options.option2,
        options.option3,
        options.option4,
      ],
      CreatedON: formattedDate,
      Template:selectedTemplate,
      LastUpdated:  "",
      correct_answer: options.option1,
      Explanation: mcqExplanation,
      Tags: mcqtags
    };
    try {
      const response = await axios.post(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/course-plan/",
        mcqData
      );
      if (response.status === 200) {
        setShowSucModal(true);
        setTimeout(() => {
          setShowSucModal(false);
        }, 2000);
        setMCQQuestion("");
        setOptions({
          option1: "",
          option2: "",
          option3: "",
          option4: "",
        });
        setMCQExplanation("");
        setmcqtags([])
        setCurrentFile("defaultQn")
      }
      fetchNameOfFile()
      fetchCount()
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };
  const handleMCQUpdate = async () => {
    setIsLoading(true);
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    const mcqData = {
      subtopic_id: selectedSubTopic,
      level: selectedDifficulty,
      Last_Updated_by: sessionStorage.getItem("Email"),
      type: "mcq",
      question: mcqQuestion,
      options: [
        options.option1,
        options.option2,
        options.option3,
        options.option4,
      ],
      currentFile:currentFile,
      LastUpdated: currentFile ? formattedDate : "",
      correct_answer:options.option1,
      Explanation: mcqExplanation,
      Tags: mcqtags,
      Template:selectedTemplate,
    };
    try {
      const response = await axios.post(
        "https://exskilence-suite-be.azurewebsites.net/Content_creation/course-plan/",
        mcqData
      );

      if (response.status === 200) {
        setShowSucModal(true);
        setTimeout(() => {
          setShowSucModal(false);
        }, 2000);
        setMCQQuestion("");
        setOptions({
          option1: "",
          option2: "",
          option3: "",
          option4: "",
        });
        setMCQExplanation("");
        setmcqtags([])
        setCurrentFile("defaultQn")
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setIsLoading(false);
  };
  const handlePreview = async (value) => {
    let path;
    switch (value) {
      case '1':
        path = "https://storeholder.blob.core.windows.net/tpdata/MCQTemplates/mcqtemplate1.html";
        break;
      case '2':
        path = "https://storeholder.blob.core.windows.net/tpdata/MCQTemplates/mcqtemplate2.html";
        break;
      default:
        path = "https://storeholder.blob.core.windows.net/tpdata/MCQTemplates/mcqtemplate3.html";
    }
    console.log('preview triggeresd ',path)
    const json = {
      options: [
        options.option1,
        options.option2,
        options.option3,
        options.option4,
      ],
      correct_answer: options[0],  
    };
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Failed to fetch the HTML file.");
      const textContent = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = textContent;
      tempDiv.querySelector('#que').textContent = mcqQuestion;
      tempDiv.querySelector('#option1').textContent = `A) ${options.option1}`;
      tempDiv.querySelector('#option2').textContent = `B) ${options.option2}`;
      tempDiv.querySelector('#option3').textContent = `C) ${options.option3}`;
      tempDiv.querySelector('#option4').textContent = `D) ${options.option4}`;
      tempDiv.querySelector('#exp').textContent = mcqExplanation;
      setHtmlContent(tempDiv.innerHTML);
      openHTMLModal();
    } catch (error) {
      console.error("Error fetching the HTML:", error);
    }
  };
  return (
    <div
      className="container-fluid p-0"
      style={{
        height: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        style={{ zIndex: "1000" }}
      />
      <div
        style={{
          marginLeft: isOpen ? "160px" : "70px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <nav className="navbar mb-0">
          <div className="container-fluid">
            <button
            className="btn btn-dark btn-sm text-white me-2"
            onClick={()=> navigate(-1)}
          >
            Back
          </button>
            <h3 className="">{sub_name} Content Creation</h3>
            <span>
              <button
                className="btn btn-success btn-sm text-white ms-2"
                onClick={openModal}
              >
                Save
              </button>
            </span>
          </div>
        </nav>
        <div
          className="row mt-3 "
          style={{ width: "100%", overflow: "hidden" }}
        >
          {isLoading && (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 9999,
              }}
            >
              <PulseLoader size={10} className="px-2" />
              <FadeLoader />
              <PulseLoader size={10} />
            </div>
          )}
          <div className="col bg-white ">
            <div className=" ps-3">
              <div>
                <div className="container-fluid">
                  <div className="row p-0">
                    <div className="col-6 p-1">
                      <label htmlFor="concept" className="form-label fs-4">
                        Choose Topic :
                      </label>
                      <select
                        onChange={handleTopicChange}
                        className="form-select"
                        value={selectedTopic}
                      >
                        <option value="">Select a Topic</option>
                        {topics.map((topic) => (
                          <option key={topic.topic_id} value={topic.topic_id}>
                            {topic.topic_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6 p-1 d-flex align-items-center justify-content-center">
                      <h4>Total Questions : {(contentType==="Coding")?count.coding:(contentType==="MCQ")?count.mcq:count.total}</h4>
                    </div>
                  </div>
                </div>
                <div className="container-fluid">
                  <div className="row p-0">
                    <div className="col-6 p-1">
                      <label htmlFor="concept" className="form-label fs-4">
                        Choose Sub Topic :
                      </label>
                      <select
                        disabled={!selectedTopic}
                        onChange={handleSubTopicChange}
                        className="form-select"
                        value={selectedSubTopic}
                      >
                        <option value="">Select a Subtopic</option>
                        {subTopics.map((subTopic) => (
                          <option
                            key={subTopic.subtopic_id}
                            value={subTopic.subtopic_id}
                          >
                            {subTopic.subtopic_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6 p-1 ">
                      <label
                        htmlFor="chooseContentType"
                        className="form-label fs-4"
                      >
                        Choose Type :
                      </label>
                      <select
                        className="form-select"
                        id="content_type"
                        value={contentType}
                        onChange={handleContentTypeChange}
                        disabled={isContentTypeDisabled}
                      >
                        <option value="default">Select a Type</option>
                        <option value="Content">Content</option>
                        <option value="MCQ">MCQ</option>
                        <option value="Coding">Coding</option>
                        {/* <option value="previous">
                          Previous Interview Questions
                        </option> */}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {(contentType === "Coding" ||
                contentType === "MCQ" ||
                contentType == "default") && (
                <div className="">
                  <div className="container-fluid">
                    <div className="row p-0">
                      <div className="col-6 p-1 ">
                        <label
                          htmlFor="chooseQuestion"
                          className="form-label fs-4"
                        >
                          Choose Level :
                        </label>
                        <select
                          className="form-select"
                          id="quelevel"
                          onChange={handleRadioChangeDiff}
                          value={selectedDifficulty}
                          disabled={currentFile !== "defaultQn"} 
                        >
                          <option value="default">Select</option>
                          <option value="level1">Level 1</option>
                          <option value="level2">Level 2</option>
                          <option value="level3">Level 3</option>
                        </select>
                      </div>
                      <div className="col-6 p-1">
                        <label
                          htmlFor="chooseQuestion"
                          className="form-label fs-4"
                        >
                          Choose Question :
                        </label>
                        <select
                          className="form-select"
                          id="quechange"
                          onChange={handleQuestionChange}
                          value={currentFile}
                        >
                          <option value="defaultQn">Select</option>
                          {Array.isArray(DisplayFiles) ? (
                            DisplayFiles.map((fileName) => {
                              const difficultyChar = fileName
                                .charAt(fileName.length - 9)
                                .toUpperCase();
                              const formattedFileName = fileName.slice(-7, -5);
                              if (
                                selectedDifficulty === "default" ||
                                (selectedDifficulty === "level1" &&
                                  difficultyChar === "E") ||
                                (selectedDifficulty === "level2" &&
                                  difficultyChar === "M") ||
                                (selectedDifficulty === "level3" &&
                                  difficultyChar === "H")
                              ) {
                                return (
                                  <option key={fileName} value={fileName}>
                                    {difficultyChar + formattedFileName}
                                  </option>
                                );
                              }
                              return null;
                            })
                          ) : (
                            <option value="">No Questions available</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {contentType === "MCQ" && (
                <div className="container-fluid p-1">
                   <div className="d-flex justify-content-end mb-2">
                      <button className="btn btn-primary btn-sm" disabled={!mcqQuestion || !options.option1 || !options.option2 || !options.option3 || !options.option4 || !mcqExplanation} onClick={()=>handlePreview(selectedTemplate)}>
                        Preview
                      </button>
                    </div>
                  <form className="shadow px-2 py-2 rounded border">
                   
                    <div className="mb-3">
                      <label htmlFor="question" className="form-label">
                        Question:
                      </label>
                      <input
                        type="text"
                        id="question"
                        name="question"
                        className="form-control"
                        value={mcqQuestion}
                        onChange={handleInputChange}
                        placeholder="Enter the question"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Options : (Option 1 is correct)</label>
                      <div className="row">
                        {["option1", "option2", "option3", "option4"].map(
                          (option, index) => (
                            <div key={index} className="col-lg-6 col-12 mb-2">
                              <input
                                type="text"
                                name={option}
                                className="form-control"
                                value={options[option]}
                                style={{border : option=="option1"?"3px solid green":"none"}}
                                onChange={handleInputChange}
                                placeholder={`Option ${index + 1}`}
                                required
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="explanation" className="form-label">
                        Explanation:
                      </label>
                      <textarea
                        id="explanation"
                        name="explanation"
                        className="form-control"
                        value={mcqExplanation}
                        onChange={handleInputChange}
                        placeholder="Provide an explanation for the correct answer"
                        rows="4"
                        required
                      />
                    </div>
                   
                  </form>
                  <div className="mb-4">
                            <h5 className="text-muted">Enter Tags :</h5>
                            {mcqtags.map((tag, index) => (
                              <div
                                key={index}
                                className="mb-3 position-relative"
                              >
                                <div className="form-group">
                                  <label htmlFor={`tag${index}`}>
                                    Tag {index + 1}:
                                  </label>
                                  <input
                                    type="text"
                                    id={`tag${index}`}
                                    className="form-control mb-2"
                                    value={tag}
                                    onChange={(e) =>
                                      handleMCQtagChange(index, e.target.value)
                                    }
                                    placeholder="Enter tag"
                                  />
                                  <button
                                    className="btn-close position-absolute top-0 end-0"
                                    aria-label="Close"
                                    onClick={() => {
                                      setmcqtags((prevtags) =>
                                        prevtags.filter((_, i) => i !== index)
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              className="btn text-light btn-sm mt-1"
                              style={{ backgroundColor: "#377383" }}
                              onClick={addMCQtag}
                            >
                              Add MCQ tag
                            </button>
                          </div>
                </div>
              )}
              {contentType === "Content" && (
              <div className="container-fluid p-0 pt-2">
              <h5>File and URL upload</h5>
              {error && <div className="alert alert-danger">{error}</div>}
              <form
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "5px",
                }}
              >
                <div className="d-flex justify-content-between">
                <h4>Videos : </h4> 
                <button
                  type="button"
                  className="p-0 text-center fs-5 d-flex align-items-center justify-content-center m-0 btn btn-primary"  style={{width:"30px",height:"30px"}}
                  onClick={addVideoInput}
                >
                  +
                </button>
                </div>
                {videos &&
        Object.values(videos).map((video, index) => (
                  <div key={index} className="mb-3 ">
                    <div className="d-flex justify-content-between">
                    <label className="form-label" style={{ marginRight: "10px" }}>
                      Video {index + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="p-0 text-center d-flex align-items-center justify-content-center m-0 btn btn-danger" style={{width:"20px",height:"20px"}}
                    >
                      x
                    </button>
                    </div>
                    <input
                      type="path"
                      className="form-control ms-2"
                      value={video.path}
                      onChange={(e) => handleVideoUrlChange(e, index)}
                      placeholder="Enter video URL"
                    />
                    <br/>
                    <input
                      type="text"
                      className="form-control ms-2"
                      value={video.text}
                      onChange={(e) => handleVideoDescriptionChange(e, index)}
                      placeholder="Enter video description"
                    />
                    <br/>
                    <div className="row">
                      <div className="col-6 pe-3">
                      <label
                        htmlFor="chooseContentType"
                        className="form-label fs-6 ms-2"
                      >
                        Enter Time in minutes :
                      </label>
                      <input
                      type="number"
                      className="ms-2 p-1 w-100"
                      style={{height:"30px"}}
                      value={video.time}
                      onChange={(e) => handleVideoTimeChange(e, index)}
                      placeholder="Enter video time in minutes (Number)"
                    />
                      </div>

                     <div className="col-6">
                      <label
                        htmlFor="chooseContentLevel"
                        className="form-label fs-6 ms-2"
                      >
                        Choose Level :
                      </label>
                      <select
                        className="ms-2 p-1 w-100"
                        id="level"
                        style={{height:"30px"}}
                        value={video.level}
                        onChange={(e) => handleVideoLevelChange(e, index)}
                        // value={contentType}
                        // onChange={handleContentTypeChange}
                      >
                        <option value="level1">Level1</option>
                        <option value="level2">Level2</option>
                        <option value="level3">Level3</option>
                      </select>
                    </div>
                    </div>
                  </div>
                ))}
        
        <div className="d-flex justify-content-between">
                <h4>Files : </h4> 
                <button
                  type="button"
                  className="p-0 text-center fs-5 d-flex align-items-center justify-content-center m-0 btn btn-primary"  style={{width:"30px",height:"30px"}}
                  onClick={addFileInput}
                >
                  +
                </button>
                </div>
{files &&
  Object.values(files).map((file, index) => (
    <div key={index} className="mb-3">
      <div className="d-flex justify-content-between">
        <label className="form-label" style={{ marginRight: "10px" }}>
          File {index + 1}
        </label>
        <button
          type="button"
          onClick={() => removeFile(index)}
          className="p-0 text-center d-flex align-items-center justify-content-center m-0 btn btn-danger"
          style={{ width: "20px", height: "20px" }}
        >
          x
        </button>
      </div>
      {file.path ? (
        <div>
           <input
            type="file"
            className="form-control ms-2"
            onChange={(e) => handleFileChange(e, index)}
            accept=".txt, .pdf, .doc, .docx,.html,.pptx,.ppt"
          /> 
          <a className="ms-2 m-2" href={file.path} target="_blank" rel="noopener noreferrer">
            Download File {index + 1}
          </a>
          <input
            type="text"
            className="form-control ms-2"
            value={file.text}
            onChange={(e) => handleFileDescriptionChange(e, index)}
            placeholder="Enter file description"
          />
          <br />
          <div className="row">
                      <div className="col-6 pe-3">
                      <label
                        htmlFor="chooseContentType"
                        className="form-label fs-6 ms-2"
                      >
                        Enter Time in minutes :
                      </label>
                      <input
                      type="number"
                      className="ms-2 p-1 w-100"
                      style={{height:"30px"}}
                      value={file.time}
                      onChange={(e) => handleFileTimeChange(e, index)}
                      placeholder="Enter file time in minutes (Number)"
                    />
                      </div>

                     <div className="col-6">
                      <label
                        htmlFor="chooseContentLevel"
                        className="form-label fs-6 ms-2"
                      >
                        Choose Level :
                      </label>
                      <select
                        className="ms-2 p-1 w-100"
                        id="level"
                        style={{height:"30px"}}
                        value={file.level}
                        onChange={(e) => handleFileLevelChange(e, index)} 
                      >
                        <option value="level1">Level1</option>
                        <option value="level2">Level2</option>
                        <option value="level3">Level3</option>
                      </select>
                    </div>
                    </div>
            </div>
                 ) : (
                <div>
                    <input
                    type="file"
                    className="form-control ms-2"
                    onChange={(e) => handleFileChange(e, index)}
                    accept=".txt, .pdf, .doc, .docx,.html"
                  />
                  <br />
                  <input
                    type="text"
                    className="form-control ms-2"
                    value={file.text}
                    onChange={(e) => handleFileDescriptionChange(e, index)}
                    placeholder="Enter file description"
                  />
                  <br />
                  <div className="row">
                              <div className="col-6 pe-3">
                              <label
                                htmlFor="chooseContentType"
                                className="form-label fs-6 ms-2"
                              >
                                Enter Time in minutes :
                              </label>
                              <input
                              type="number"
                              className="ms-2 p-1 w-100"
                              style={{height:"30px"}}
                              value={file.time}
                    onChange={(e) => handleFileTimeChange(e, index)}
                    placeholder="Enter file time in minutes (Number)"
                            />
                              </div>

                             <div className="col-6">
                              <label
                                htmlFor="chooseContentLevel"
                                className="form-label fs-6 ms-2"
                              >
                                Choose Level :
                              </label>
                              <select
                                className="ms-2 p-1 w-100"
                                id="level"
                                style={{height:"30px"}}
                                value={file.level}
                                onChange={(e) => handleFileLevelChange(e, index)}
                                // value={contentType}
                                // onChange={handleContentTypeChange}
                              >
                                <option value="level1">Level1</option>
                        <option value="level2">Level2</option>
                        <option value="level3">Level3</option>
                              </select>
                            </div>
                            </div>
                      </div>
                    )}
                  </div>
                ))}

              </form>
        
            </div>
              )}
              {contentType === "Coding" && (
                <>
                  {(sub_name.startsWith("Python") || sub_name.startsWith("DSA")) && (
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mb-4">
                          <h5 className="text-muted">Question:</h5>
                          <textarea
                            id="que"
                            rows="4"
                            placeholder="Enter Question here....."
                            className="form-control"
                            value={selectedQuestion}
                            onChange={(e) =>
                              setSelectedQuestion(e.target.value)
                            }
                          ></textarea>
                        </div>
                        <DefaultTemplate
                          key={refreshKey}
                          defaultTemplate={defaultTemplate}
                          setdefaultTemplate={setdefaultTemplate}
                        />
                        <div className="mb-4">
                          <h5 className="text-muted">Examples:</h5>
                          {examples.map((example, exampleIndex) => (
                            <div
                              key={exampleIndex}
                              className="example mt-3 position-relative"
                            >
                              <button
                                className="btn-close bg-danger position-absolute top-0 end-0"
                                aria-label="Close"
                                onClick={() => removeExample(exampleIndex)}
                              />
                              <div className="form-group">
                                <p>
                                  Enter Example {exampleIndex + 1} values,
                                  output, and explanation:
                                </p>
                                <label>Values:</label>
                                {example.Inputs.map((value, valueIndex) => (
                                  <div
                                    key={valueIndex}
                                    className="mb-2 position-relative"
                                  >
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={value}
                                      onChange={(e) =>
                                        handleExampleValueChange(
                                          exampleIndex,
                                          valueIndex,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Enter value ${
                                        valueIndex + 1
                                      }`}
                                    />
                                    {example.Inputs.length > 1 && (
                                      <button
                                        className="btn-close position-absolute top-0 end-0"
                                        aria-label="Close"
                                        onClick={() =>
                                          removeExampleValue(
                                            exampleIndex,
                                            valueIndex
                                          )
                                        }
                                      />
                                    )}
                                  </div>
                                ))}
                                <button
                                  className="btn text-light btn-sm mt-1"
                                  style={{ backgroundColor: "#377383" }}
                                  onClick={() => addExampleValue(exampleIndex)}
                                >
                                  Add Value
                                </button>
                              </div>
                              <div className="form-group">
                                <label>Output:</label>
                                <textarea
                                  rows="1"
                                  className="form-control"
                                  value={example.Output}
                                  onChange={(e) =>
                                    handleExampleOutputChange(
                                      exampleIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter output"
                                />
                              </div>
                              <div className="form-group">
                                <label>Explanation:</label>
                                <textarea
                                  rows="2"
                                  className="form-control"
                                  value={example.Explanation}
                                  onChange={(e) =>
                                    handleExampleExplanationChange(
                                      exampleIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter explanation"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn text-light btn-sm mt-1"
                            style={{ backgroundColor: "#377383" }}
                            onClick={addExample}
                          >
                            Add Example
                          </button>
                        </div>
                        <div className="mb-4">
                          <h5 className="text-muted">Keywords:</h5>
                          {keywords.map((keyword, index) => (
                            <div key={index} className="mb-3 position-relative">
                              <div className="form-group">
                                <label htmlFor={`keyword${index}`}>
                                  Keyword {index + 1}:
                                </label>
                                <input
                                  type="text"
                                  id={`keyword${index}`}
                                  className="form-control mb-2"
                                  value={keyword}
                                  onChange={(e) =>
                                    handleKeywordChange(index, e.target.value)
                                  }
                                  placeholder="Enter keyword"
                                />
                                <button
                                  className="btn-close position-absolute top-0 end-0"
                                  aria-label="Close"
                                  onClick={() => {
                                    setKeywords((prevKeywords) =>
                                      prevKeywords.filter((_, i) => i !== index)
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn text-light btn-sm mt-1"
                            style={{ backgroundColor: "#377383" }}
                            onClick={addKeyword}
                          >
                            Add Keyword
                          </button>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-muted">Explanation:</h5>
                          {explain.map((explanation, index) => (
                            <div key={index} className="mb-3 position-relative">
                              <div className="form-group">
                                <label htmlFor={`explanation${index}`}>
                                  Explanation {index + 1}:
                                </label>
                                <textarea
                                  rows="2"
                                  className="form-control mb-2"
                                  value={explanation}
                                  onChange={(e) =>
                                    handleExplainChange(index, e.target.value)
                                  }
                                  placeholder="Enter explanation"
                                />
                                <button
                                  className="btn-close position-absolute top-0 mt-1 end-0"
                                  aria-label="Close"
                                  onClick={() => {
                                    setExplain((prevExplain) =>
                                      prevExplain.filter((_, i) => i !== index)
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn text-light mt-1 btn-sm"
                            style={{ backgroundColor: "#377383" }}
                            onClick={addExplanation}
                          >
                            Add Explanation
                          </button>
                        </div>
                        <div className="mb-4">
                          <h5 className="text-muted">Hints:</h5>
                          {hints.map((hint, index) => (
                            <div key={index} className="mb-3 position-relative">
                              <div className="form-group">
                                <label htmlFor={`hint${index}`}>
                                  Hint {index + 1}:
                                </label>
                                <input
                                  type="text"
                                  id={`hint${index}`}
                                  className="form-control mb-2"
                                  value={hint}
                                  onChange={(e) =>
                                    handleHintChange(index, e.target.value)
                                  }
                                  placeholder="Enter Hint"
                                />
                                <button
                                  className="btn-close position-absolute top-0 end-0"
                                  aria-label="Close"
                                  onClick={() => {
                                    setHints((prevHints) =>
                                      prevHints.filter((_, i) => i !== index)
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn text-light btn-sm mt-1"
                            style={{ backgroundColor: "#377383" }}
                            onClick={addHint}
                          >
                            Add Hint
                          </button>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="">
                          <Compiler
                            key={refreshKey}
                            code1={code1}
                            setCode1={setCode1}
                            code2={code2}
                            setCode2={setCode2}
                          />
                          <div className="mb-4">
                            <h5 className="text-muted">Enter Tags :</h5>
                            {tags.map((tag, index) => (
                              <div
                                key={index}
                                className="mb-3 position-relative"
                              >
                                <div className="form-group">
                                  <label htmlFor={`tag${index}`}>
                                    Tag {index + 1}:
                                  </label>
                                  <input
                                    type="text"
                                    id={`tag${index}`}
                                    className="form-control mb-2"
                                    value={tag}
                                    onChange={(e) =>
                                      handletagChange(index, e.target.value)
                                    }
                                    placeholder="Enter tag"
                                  />
                                  <button
                                    className="btn-close position-absolute top-0 end-0"
                                    aria-label="Close"
                                    onClick={() => {
                                      settags((prevtags) =>
                                        prevtags.filter((_, i) => i !== index)
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              className="btn text-light btn-sm mt-1"
                              style={{ backgroundColor: "#377383" }}
                              onClick={addtag}
                            >
                              Add tag
                            </button>
                          </div>
                          <div className="mb-4">
                            <h5 className="text-muted">Test cases:</h5>
                            {testCases.map((testCase, testCaseIndex) => (
                              <div
                                key={testCaseIndex}
                                className="test-case mt-3 position-relative"
                              >
                                <button
                                  className="btn-close bg-danger position-absolute top-0 end-0"
                                  aria-label="Close"
                                  onClick={() => removeTestCase(testCaseIndex)}
                                />
                                <div className="form-group">
                                  <p>
                                    Enter Test case {testCaseIndex + 1} values
                                    and output:
                                  </p>
                                  <label>Values:</label>
                                  {testCase.Value.map((value, valueIndex) => (
                                    <div
                                      key={valueIndex}
                                      className="mb-2 position-relative"
                                    >
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={value}
                                        onChange={(e) =>
                                          handleTestCaseValueChange(
                                            testCaseIndex,
                                            valueIndex,
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Enter value ${
                                          valueIndex + 1
                                        }`}
                                      />
                                      {testCase.Value.length > 1 && (
                                        <button
                                          className="btn-close position-absolute top-0 end-0"
                                          aria-label="Close"
                                          onClick={() =>
                                            removeTestCaseValue(
                                              testCaseIndex,
                                              valueIndex
                                            )
                                          }
                                        />
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    className="btn text-light btn-sm mt-1"
                                    style={{ backgroundColor: "#377383" }}
                                    onClick={() =>
                                      addTestCaseValue(testCaseIndex)
                                    }
                                  >
                                    Add Value
                                  </button>
                                </div>
                                <div className="form-group">
                                  <label>Output:</label>
                                  <textarea
                                    rows="1"
                                    className="form-control"
                                    value={testCase.Output}
                                    onChange={(e) =>
                                      handleTestCaseOutputChange(
                                        testCaseIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter output"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              className="btn text-light btn-sm mt-1"
                              style={{ backgroundColor: "#377383" }}
                              onClick={addTestCase}
                            >
                              Add Test Case
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sub_name.startsWith("SQL") && (
                    <>
                          <div className="container-fluid p-0">
      <nav className="navbar"></nav>
      <div className="form-container">
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="row">
            <div className="col-lg-6 mb-2 col-12">
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="question">Question</label>
                  <textarea
                    id="sqquestion"
                    name="question"
                    className="form-control"
                    value={sqlqn || ""}
                    onChange={(e) => setsqlQn(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="question">Table</label>
                  <input
                    id="sqtable"
                    name="table"
                    className="form-control"
                    value={sqltable || ""}
                    onChange={(e) => setTable(e.target.value)}
                    required
                  />

                 
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label>Select table</label>
                  <div
                    className="ctbls"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <input
                        type="checkbox"
                        id="lecturers"
                        name="tables"
                        value="Lecturers"
                        onChange={handleCheckboxChange}
                        checked={selectedTables.includes("Lecturers")}
                      />
                      <label htmlFor="lecturers">Lecturers</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="subjects"
                        name="tables"
                        value="Subjects"
                        onChange={handleCheckboxChange}
                        checked={selectedTables.includes("Subjects")}
                      />
                      <label htmlFor="subjects">Subjects</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="marks"
                        name="tables"
                        value="Marks"
                        onChange={handleCheckboxChange}
                        checked={selectedTables.includes("Marks")}
                      />
                      <label htmlFor="marks">Marks</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="companies"
                        name="tables"
                        value="Companies"
                        onChange={handleCheckboxChange}
                        checked={selectedTables.includes("Companies")}
                      />
                      <label htmlFor="companies">Companies</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="branches"
                        name="tables"
                        value="Branches"
                        onChange={handleCheckboxChange}
                        checked={selectedTables.includes("Branches")}
                      />
                      <label htmlFor="branches">Branches</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="students"
                        name="tables"
                        value="Students"
                        onChange={handleCheckboxChange}
                        checked={selectedTables.includes("Students")}
                      />
                      <label htmlFor="students">Students</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="colleges"
                        name="tables"
                        value="Colleges"
                        onChange={handleCheckboxChange}
                        checked={selectedTables.includes("Colleges")}
                      />
                      <label htmlFor="colleges">Colleges</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="expectedQuery">Expected Output Query</label>
                  <textarea
                    id="expectedQuery"
                    name="expectedQuery"
                    className="form-control"
                    value={sqlquery || ""}
                    onChange={(e) => setsqlQuery(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRunClick}
                  >
                    Run
                  </button>
                </div>
              </div>
              <div className="row mb -3">
                <div className="col" id="expectedop">
                  <h5>Output Table</h5>
                </div>
              </div>
              <br></br>
              <div id="textAreaContainer" className="">
                <div className="row">
                    
                </div>
                <div className="row ">
                <div className="col-12">
                          <h5 className="text-muted">Explanation:</h5>
                          {sqlexplain.map((explanation, index) => (
                            <div key={index} className="mb-3 position-relative">
                              <div className="form-group">
                                <label htmlFor={`explanation${index}`}>
                                  Explanation {index + 1}:
                                </label>
                                <textarea
                                  rows="2"
                                  className="form-control mb-2"
                                  value={explanation}
                                  onChange={(e) =>
                                    handleSQLExplainChange(index, e.target.value)
                                  }
                                  placeholder="Enter explanation"
                                />
                                <button
                                  className="btn-close position-absolute top-0 mt-1 end-0"
                                  aria-label="Close"
                                  onClick={() => {
                                    setsqlExplain((prevExplain) =>
                                      prevExplain.filter((_, i) => i !== index)
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn text-light mt-1 btn-sm"
                            style={{ backgroundColor: "#377383" }}
                            onClick={addSQLExplanation}
                          >
                            Add Explanation
                          </button>
                        </div>
                        <div className=" col-12">
                          <h5 className="text-muted">Hints:</h5>
                          {sqlhints.map((hint, index) => (
                            <div key={index} className="mb-3 position-relative">
                              <div className="form-group">
                                <label htmlFor={`hint${index}`}>
                                  Hint {index + 1}:
                                </label>
                                <input
                                  type="text"
                                  id={`hint${index}`}
                                  className="form-control mb-2"
                                  value={hint}
                                  onChange={(e) =>
                                    handlesqlHintChange(index, e.target.value)
                                  }
                                  placeholder="Enter Hint"
                                />
                                <button
                                  className="btn-close position-absolute top-0 end-0"
                                  aria-label="Close"
                                  onClick={() => {
                                    setsqlHints((prevHints) =>
                                      prevHints.filter((_, i) => i !== index)
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn text-light btn-sm mt-1"
                            style={{ backgroundColor: "#377383" }}
                            onClick={addsqlHint}
                          >
                            Add Hint
                          </button>
                        </div>
                </div>


                <div className="row mt-4">
                <div className="col-12">
  <h5 className="text-muted">Tags:</h5>
  {sqltags.map((tag, index) => (
    <div key={index} className="mb-3 position-relative">
      <div className="form-group">
        <label htmlFor={`tag${index}`}>
          Tag {index + 1}:
        </label>
        <textarea
          rows="2"
          className="form-control mb-2"
          value={tag} // Set the individual tag value here
          onChange={(e) =>
            handleSQLTagsChange(index, e.target.value)
          }
          placeholder="Enter tag"
        />
        <button
          className="btn-close position-absolute top-0 mt-1 end-0"
          aria-label="Close"
          onClick={() => {
            setsqlTags((prevTags) =>
              prevTags.filter((_, i) => i !== index)
            );
          }}
        />
      </div>
    </div>
  ))}
  <button
    className="btn text-light mt-1 btn-sm"
    style={{ backgroundColor: "#377383" }}
    onClick={addSQLTags} // Add a new empty tag
  >
    Add Tags
  </button>
</div>
                        <div className=" col-12"> <h5 className="text-muted mt-4">SQL Test Cases:</h5>
  {SQLTestCases.map((testCase, index) => (
    <div key={index} className="mb-3 position-relative">
        <label htmlFor={`sqlTestCase${index}`}>
          Test Case {index + 1}:
        </label>
        <textarea
          rows="2"
          className="form-control mb-2"
          value={testCase} // Set the test case value here
          onChange={(e) =>
            handleSQLTestCaseChange(index, e.target.value) // Update Test Case
          }
          placeholder="Enter testcase"
        />
     
      <button
        className="btn-close position-absolute top-0 mt-1 end-0"
        aria-label="Close"
        onClick={() => {
          setSQLTestCases((prevTestCases) =>
            prevTestCases.filter((_, i) => i !== index)
          );
        }}
      />
    </div>
  ))}
  <button
    className="btn text-light mt-1 btn-sm"
    style={{ backgroundColor: "#377383" }}
    onClick={addSQLTestCase}
  >
    Add Test Case
  </button>
</div>
                </div>
              </div>
            </div>
             <div
              className="col-lg-6 col-12">
            <div
              className="row"
              style={{ height: "100%", maxHeight: "900px", overflowY: "auto" }}
            >
              <div className="tables">
                <div>
                  <h5 style={{ textAlign: "center" }}>Tables</h5>
                  {sqlerror ? (
                    <p>Error fetching data: {sqlerror}</p>
                  ) : Object.keys(sqldata).length ? (
                    Object.keys(sqldata).map((key) => renderTable(key, sqldata[key]))
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
              
            </div>
            </div>
           
          </div>
          <div className="row mb-3">
            <div
              className="col text-end"
              style={{
                position: "fixed",
                top: "10px",
                right: "0px",
                zIndex: "9999",
              }}
            >
            </div>
          </div>
        </form>
      </div>
      {/* <ApprovalModal
        isOpen={issqlModalOpen}
        onClose={handlesqlClose}
        onConfirm={handlesqlConfirm}
      /> */}
      
    </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <SuccessModal
            show={showSucModal}
            onHide={() => setShowSucModal(false)}
          />
          <EditedSucModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
          />
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            onConfirm={confirmSave}
          />
           <HTMLModal
        isOpen={isHtmlModalOpen}
        onRequestClose={closeHTMLModal}
        contentLabel="MCQ Preview"
        appElement={document.getElementById('root')}  
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)"
          },
          content: {
            maxWidth: "80%",
            margin: "auto",
            padding: "15px",
            borderRadius: "8px",
            background: "#fff",
            overflow: "auto"
          }
        }}
      >
        <div style={{ position: 'absolute', left: '10px', top: '10px' }}>
          <label className="fw-bold">Choose Template : </label>
          <select
            value={selectedTemplate}
            onChange={(e) => template(e) }
            className="dropdown ms-2"
          >
            <option value="1">Template 1</option>
            <option value="2">Template 2</option>
            <option value="3">Template 3</option>
          </select>
        </div>
        <div className="d-flex justify-content-end mt-0">
          <button className="bg-danger text-light border-0" onClick={closeHTMLModal}>X</button>
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </HTMLModal>
        </div>
      </div>
    </div>
  );
}
export default Creator;