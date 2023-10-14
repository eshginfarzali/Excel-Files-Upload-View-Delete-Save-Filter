/*eslint-disable*/
import { Modal, Input, Select } from "antd";

const { Option } = Select;

export const AddEditModal = ({
  isModalVisible,
  handleSave,
  handleCancel,
  modalData,
  setModalData,
  formData,
  setFormData,
}) => {
  return (
    <Modal
      title={modalData ? "Edit Row" : "Add New Data"}
      visible={isModalVisible}
      onOk={handleSave}
      onCancel={handleCancel}
    >
      <div>
        <label>len:</label>
        <Input
  value={modalData ? modalData.len : formData.len}
  onChange={(e) => {
    if (modalData) {
      setModalData({ ...modalData, len: e.target.value });
    } else {
      setFormData({ ...formData, len: e.target.value });
    }
  }}
/>

      </div>
      <br />
      <div>
        <label>status:</label>
        <Select
          style={{ width: 90 }}
          value={modalData ? modalData.status : formData.status}
          onChange={(value) => {
            if (modalData) {
              setModalData({ ...modalData, status: value });
            } else {
              setFormData({ ...formData, status: value });
            }
          }}
        >
          <Option value="0">0</Option>
          <Option value="1">1</Option>
          <Option value="2">2</Option>
        </Select>
      </div>
    </Modal>
  );
};
