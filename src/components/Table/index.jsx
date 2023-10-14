import { useState, useRef } from "react";
import {
  Upload,
  Button,
  Table,
  Input,
  Space,
  Alert,
} from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import * as XLSX from "xlsx";
import { AddEditModal } from "../Modal";

export const ExcelTable = () => {
  const [excelData, setExcelData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef();
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [formData, setFormData] = useState({ len: "", status: "" });

  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);

  const handleDelete = (record) => {
    const updatedData = excelData.filter((item) => item.id !== record.id);
    setExcelData(updatedData);
  };

  const handleFile = (e) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text.csv",
    ];
    let selectedFile = e.fileList[0]?.originFileObj;

    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
          handleFileSubmit(e.target.result);
        };
      } else {
        setTypeError("Please select only excel file types");
        setExcelFile(null);
      }
    } else {
      setTypeError("Please select your file");
    }
  };

  const handleFileSubmit = (fileData) => {
    const workbook = XLSX.read(fileData, { type: "buffer" });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

 
    const maxId = Math.max(...excelData.map(item => item.id), 0);

    const newData = data.map((item, index) => ({
      ...item,
      id: maxId + 1 + index
    }));
  
    setExcelData(newData);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex] &&
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns =
    excelData.length > 0
      ? Object.keys(excelData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key: key,
          width: "20%",
          ...getColumnSearchProps(key),
          sorter: (a, b) => (a[key] > b[key] ? 1 : -1),
        }))
      : [];


const generateUniqueId = (data) => {
  const maxId = Math.max(...data.map(item => item.id), 0);
  return maxId + 1;
};

let modalDataCopy = modalData;

const handleSave = () => {
  const newData = [...excelData];
  if (modalDataCopy === null) {
  
    const newId = generateUniqueId(newData);
    modalDataCopy = { id: newId, len: formData.len, status: formData.status };
    newData.push(modalDataCopy);
  } else {
    const index = newData.findIndex((item) => modalDataCopy.id === item.id);
    newData[index] = modalDataCopy;
  }
  setExcelData(newData);
  setIsModalVisible(false);
};





  const showAddModal = () => {
    setIsModalVisible(true);
    setModalData(null);
  };

  return (
    <div>
      {typeError && <Alert message={typeError} type="error" showIcon />}
      <Upload
        name="file"
        accept=".xlsx"
        maxCount={1}
        fileList={[]}
        onChange={handleFile}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined/>}>Load Excel File</Button>
      </Upload>
      {excelData.length > 0 && (
        <Button type="primary" onClick={showAddModal}>
          Add New Data
        </Button>
      )}
      <Table
        columns={[
          ...columns,
          {
            dataIndex: "actions",
            render: (_, record) => {
              const editable = record.id === editingKey;
              return (
                <div>
                  {editable ? (
                    <Space>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => setEditingKey("")}
                      >
                        Cancel
                      </Button>
                    </Space>
                  ) : (
                    <Space>
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setModalData(record);
                          setIsModalVisible(true);
                        }}
                      >
                      
                      </Button>
                      <Button
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                      >
                  
                      </Button>
                    </Space>
                  )}
                </div>
              );
            },
          },
        ]}
        dataSource={excelData.map((item) => ({ ...item, key: item.id }))}
        pagination={true}
      />

      <AddEditModal
        isModalVisible={isModalVisible}
        handleSave={handleSave}
        handleCancel={() => setIsModalVisible(false)}
        modalData={modalData}
        setModalData={setModalData}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};
