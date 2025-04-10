import React, { useState, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-textmate';
import 'skulpt/dist/skulpt.min.js'; 
import 'skulpt/dist/skulpt-stdlib.js'; 

function Compiler({ defaultTemplate, setdefaultTemplate }) {

  return (
    <div className="row mb-1">
      <h5 className="text-xl text-gray-700 bg-purple-100 ">
        Enter Default Template here
      </h5>
      <AceEditor
        mode="python"
        theme="textmate"
        value={defaultTemplate}
        onChange={setdefaultTemplate}
        placeholder="Write your function code here..."
        fontSize={20}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        wrapEnabled={true}
        className="border border-ring-blue-200  col-12"
        style={{ width: '100%', borderRadius: '10px', minHeight: '80px', maxHeight: '120px' }}
      />

    </div>
  );
}

export default Compiler;
