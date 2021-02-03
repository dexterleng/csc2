function showErrorAsAlerts(e) {
  const messages = [];

  if (e.responseJSON && e.responseJSON.message) {
    messages.push(e.responseJSON.message);
  }

  // validation errors
  if (e.responseJSON && e.responseJSON.errors) {
    for (let error of e.responseJSON.errors) {
      messages.push(`[${error.field}]: ${error.description}`);
    }
  }

  if (messages.length === 0) {
    let message = "Something went wrong."

    if (e.status) {
      message = `Network request failed with status ${e.status}`
    }

    messages.push(message);
  }

  $("#alerts-container").empty();
  $("#alerts-container").append(
    messages.map(m => `
      <div class="alert alert-danger" role="alert">
        ${m}
      </div>
    `)
  );
}

// https://stackoverflow.com/a/3387116/10390454
function disableForm(id) {
  var form = document.getElementById(id);
  var elements = form.elements;
  for (var i = 0, len = elements.length; i < len; ++i) {
      elements[i].readOnly = true;
      if (elements[i].nodeName === "BUTTON") {
        elements[i].disabled = true;
      }
  }
}

function enableForm(id) {
  var form = document.getElementById(id);
  var elements = form.elements;
  for (var i = 0, len = elements.length; i < len; ++i) {
    elements[i].readOnly = false;
    if (elements[i].nodeName === "BUTTON") {
      elements[i].disabled = false;
    }
  }
}

function ajaxPromise(ajaxOptions) {
  return new Promise((resolve, reject) => {
    $.ajax(ajaxOptions)
        .done(function (data) { resolve(data) })
        .fail(function (jqXHR) { reject(jqXHR) });
  });
}

function retryingAjax(ajaxOptions, maxRetries, timeoutMs) {
    const thunk = () => ajaxPromise(ajaxOptions);
    const retry = (fn, maxRetries, timeoutMs) => new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch((e) => {
                if (maxRetries === 1 || (e.status && e.status !== 500)) {
                    return reject(e);
                }
                console.log('retrying failed promise...');
                setTimeout(() => {
                    retry(fn, maxRetries - 1, timeoutMs).then(resolve).catch(reject);
                }, timeoutMs);
            })
    });
    return retry(thunk, maxRetries, timeoutMs);
}

async function makeApiRequest(ajaxOptions, maxRetries = 5, timeoutMs = 1000) {
  const res = await retryingAjax(ajaxOptions, maxRetries, timeoutMs);
  return res;
}

class TalentRepository {
  async findAll(data) {
    const talents = await makeApiRequest({
      type: 'GET',
      url: 'api/talents/',
      data: data
    });
    return talents;
  }

  async find(id) {
    const talent = await makeApiRequest({
      type: 'GET',
      url: `/api/talents/${id}`
    });
    return talent;
  }

  async update(id, formData) {
    return await makeApiRequest({
      type: 'PUT',
      url: `/api/talents/${id}`,
      data: formData,
      contentType: false,
      processData: false,
    })
  }

  async insert(formData) {
    const res = await makeApiRequest({
      type: 'POST',
      url: '/api/talents/',
      data: formData,
      contentType: false,
      processData: false,
    });
    return res;
  }
}

class User
{
    static checkout()
    {
        return $.ajax({
            url: "/api/users/checkout",
            type: "get"
        });
    }

    static getHistory()
    {
        return $.ajax({
            url: "/api/users/history",
            type: "get"
        });
    }

    static login(username, password)
    {
        return $.ajax({
            url: "/api/users/login",
            type: "post",
            contentType: "application/json",
            data: JSON.stringify({ username, password })
        });
    }

    static register(username, password)
    {
        return $.ajax({
            url: "/api/users/register",
            type: "post",
            contentType: "application/json",
            data: JSON.stringify({ username, password })
        });
    }

    static getSubscription()
    {
        return $.ajax({
            url: "/api/users/subscription",
            type: "get"
        });
    }
}