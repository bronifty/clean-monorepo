import BooksPresenter from "./Books/BooksPresenter";
import httpGateway from "./Shared/HttpGateway";

it("should load 3 viewmodel books when 3 books loaded from api and post one book to api", async () => {
  httpGateway.get = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      success: true,
      result: [
        {
          id: 111,
          name: "Wind in the willows",
          ownerId: "pete@logicroom.co",
          author: "Kenneth Graeme",
        },
        {
          id: 121,
          name: "I, Robot",
          ownerId: "pete@logicroom.co",
          author: "Isaac Asimov",
        },
        {
          id: 131,
          name: "The Hobbit",
          ownerId: "pete@logicroom.co",
          author: "Jrr Tolkein",
        },
      ],
    });
  });
  httpGateway.post = jest.fn().mockImplementation(() => {
    return Promise.resolve({ success: true, result: "book created" });
  });
  let viewModel = null;
  let booksPresenter = new BooksPresenter();
  await booksPresenter.load((generatedViewModel) => {
    viewModel = generatedViewModel;
  });
  await booksPresenter.post({ name: "Fast TDD", author: "Pete Heard" });
  expect(httpGateway.get).toHaveBeenCalledWith("fakeurl");

  expect(httpGateway.post).toHaveBeenCalledWith("fakeurl", {
    author: "Pete Heard",
    name: "Fast TDD",
  });
  expect(viewModel.length).toBe(3);
  expect(viewModel[0].name).toBe("Wind in the willows");
  expect(viewModel[1].name).toBe("I, Robot");
  expect(viewModel[2].name).toBe("The Hobbit");
});

// it('should post one book to the api', async () => {
//   httpGateway.post = jest.fn().mockImplementation(() => {
//     return Promise.resolve({ success: true, result: 'book created' });
//   });
//   let booksPresenter = new BooksPresenter();
//   await booksPresenter.post({ name: 'Fast TDD', author: 'Pete Heard' });
//   expect(httpGateway.post).toHaveBeenCalledWith(
//     'fakeurl',
//     { author: 'Pete Heard', name: 'Fast TDD' }
//   );
// });
