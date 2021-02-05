class ResourceNotFound {
  constructor() {
    this.message = "Resource not found";
    this.responseJson = {
      message: this.message
    }
  }
}

class ResourceValidationError {
  constructor(errors) {
    this.message = "Resource failed validation error.";
    this.responseJson = {
      message: this.message,
      errors: errors
    }
  }
}

module.exports = {
  ResourceNotFound,
  ResourceValidationError
}