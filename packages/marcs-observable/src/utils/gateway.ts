export class HttpGateway {
  private requestCounter: number = 0;
  data = [
    { name: "Book 1", author: "Author 1" },
    { name: "Book 2", author: "Author 2" },
  ];

  private async delayedResponse(response: any, delay: number): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(response), delay));
  }

  private getNextDelay(): number {
    this.requestCounter += 1;
    return this.requestCounter % 2 === 0 ? 1000 : 5000;
  }

  async get(path: string): Promise<any> {
    const delay = this.getNextDelay();
    return this.delayedResponse({ result: this.data }, delay);
  }

  async post(path: string, requestDto: any): Promise<any> {
    const delay = this.getNextDelay();
    this.data.push(requestDto);
    return this.delayedResponse({ success: true }, delay);
  }

  async delete(path: string): Promise<any> {
    const delay = this.getNextDelay();
    this.data.length = 0;
    return this.delayedResponse({ success: true }, delay);
  }
}
