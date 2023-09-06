import { ObservableFactory } from "./observable.ts";
import { HttpGateway, IHttpGateway } from "./gateway.js";

const HttpGateway = new HttpGateway();

const observable = ObservableFactory.create(null);

observable.subscribe((newVal, oldVal) => {
  console.log("Data changed to", newVal, "from", oldVal);
});

observable.fetchData("/path/to/resource");
observable.fetchData("/anotherpath");
