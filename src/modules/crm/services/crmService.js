import axios from "axios";

const BASE = "/api/crm";

class CRMApiService {
  static async getPipelines(params = {}) {
    try {
      const response = await axios.get(`${BASE}/pipelines/`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getPipelineById(pipelineId) {
    try {
      const response = await axios.get(`${BASE}/pipelines/${pipelineId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updatePipeline(pipelineId, pipelineData) {
    try {
      const response = await axios.patch(`${BASE}/pipelines/${pipelineId}/`, pipelineData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      let message = data?.message || data?.detail;
      if (!message && data && typeof data === "object") {
        message = Object.entries(data)
          .map(([field, errors]) => {
            const msgs = Array.isArray(errors) ? errors.join(", ") : String(errors);
            return `${field}: ${msgs}`;
          })
          .join(" | ");
      }
      return new Error(`${status} - ${message || "An error occurred"}`);
    }
    return error;
  }
}

export default CRMApiService;
