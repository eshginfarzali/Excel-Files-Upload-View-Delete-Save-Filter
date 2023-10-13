
import { Modal, Input, Select } from "antd";

const { Option } = Select;


export const AddEditModal = ({
  isModalVisible,
  handleAddEditData,
  setModalVisible,
  formData,
  setFormData,
  isEditing, 
}) =>{
  const title = isEditing ? "Edit Data" : "Add New Data";

  return (
    <Modal
      title={title}
      visible={isModalVisible}
      onOk={handleAddEditData}
      onCancel={() => setModalVisible(false)}
    >
      <div>
        <label>len:</label>
        <Input
          value={formData.len}
          onChange={(e) => setFormData({ ...formData, len: e.target.value })}
        />
      </div>
      <div>
        <label>status:</label>
        <Select
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value })}
        >
          <Option value="0">0</Option>
          <Option value="1">1</Option>
          <Option value="2">2</Option>
        </Select>
      </div>
    </Modal>
  );
}


