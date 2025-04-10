import React, { useState, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import Sk from 'skulpt'; 
import 'skulpt/dist/skulpt.min.js'; 
import 'skulpt/dist/skulpt-stdlib.js'; 
import ace from 'ace-builds/src-noconflict/ace';


function Compiler({ code1, setCode1, code2, setCode2 }) {
  const [output, setOutput] = useState('');
  const outputRef = useRef(null);
  const [rundisable, setRundisable] = useState(false);

  const handleRunPython = () => {
    setRundisable(true);
    setOutput('');

    function builtinRead(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
        throw new Error(`File not found: '${x}'`);
      }
      return Sk.builtinFiles['files'][x];
    }

    Sk.configure({
      output: (text) => {
        setOutput((prevOutput) => prevOutput + text);
        scrollToBottom();
      },
      read: builtinRead,
      inputfun: (prompt) => {
        return new Promise((resolve) => {
          const input = promptInput(prompt);
          resolve(input); // For simplicity, resolve immediately with prompt
        });
      },
    });

    const concatenatedCode = `${code1}\n\n${code2}`;
    
    Sk.misceval.asyncToPromise(() => {
      return Sk.importMainWithBody('<stdin>', false, concatenatedCode, true);
    })
      .then(() => {
        setRundisable(false);
      })
      .catch((err) => {
        setOutput((prevOutput) => prevOutput + err.toString());
        scrollToBottom();
        setRundisable(false);
      });
  };
  const promptInput = (prompt) => {
    return new Promise((resolve) => {
      const outputElement = outputRef.current;
      setOutput((prevOutput) => prevOutput + prompt);
      outputElement.focus();
      let inputBuffer = '';
      const inputHandler = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const inputValue = inputBuffer.trim();
          setOutput((prevOutput) => prevOutput + '\n');
          outputElement.removeEventListener('keydown', inputHandler);
          resolve(inputValue);
          scrollToBottom();
        } else if (event.key.length === 1) {
          inputBuffer += event.key;
          setOutput((prevOutput) => prevOutput + event.key);
        } else if (event.key === 'Backspace') {
          inputBuffer = inputBuffer.slice(0, -1);
          setOutput((prevOutput) => prevOutput.slice(0, -1));
        }
      };
      outputElement.addEventListener('keydown', inputHandler);
    });
  };


  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  return (
    <div className="row mb-5">
      <h4 className="text-xl text-gray-700 bg-purple-100 mt-2">
        Enter your function code here
      </h4>
      <AceEditor
        mode="python"
        theme="monokai"
        value={code1}
        onChange={setCode1}
        placeholder="Write your function code here..."
        fontSize={20}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        wrapEnabled={true}
        className="border border-ring-blue-200  col-12"
        style={{ width: '100%', borderRadius: '10px', minHeight: '200px', maxHeight: '250px' }}
      />
      <h4 className="text-xl text-gray-700 bg-purple-100 mt-2">
        Enter the inputs and function call code here
      </h4>
      <AceEditor
        mode="python"
        theme="monokai"
        value={code2}
        onChange={setCode2}
        placeholder="Write your inputs and function call code here..."
        fontSize={20}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        wrapEnabled={true}
        className="border border-ring-blue-200  col-12"
        style={{ width: '100%', borderRadius: '10px', minHeight: '80px', maxHeight: '120px' }}
      />
      <div>
        <button 
          className="btn btn-success rounded px-3 mt-2" 
          disabled={rundisable} 
          style={{ backgroundColor: "#377383" }} 
          onClick={handleRunPython}
        >
          Run
        </button>
      </div>
      <h4 className="text-xl text-gray-700 mt-2">
        Output
      </h4>
      <div>
        <textarea
          id="output"
          ref={outputRef}
          readOnly
          value={output}
          className='form-control'
          style={{ width: '100%', minHeight: '200px', maxHeight: '800px' }}
        />
      </div>
    </div>
  );
}

export default Compiler;
