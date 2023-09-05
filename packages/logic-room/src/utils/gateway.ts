export class HttpGateway {
  data = [
    { name: "Book 1", author: "Author 1" },
    { name: "Book 2", author: "Author 2" },
  ];
  get = async (path) => {
    return { result: this.data };
  };
  post = async (path, requestDto) => {
    this.data.push(requestDto);
    return { success: true };
  }; // test
  delete = async (path) => {
    this.data.length = 0;
    return { success: true };
  };
}
