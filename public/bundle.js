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
  async findAll() {
    const talents = await makeApiRequest({
      type: 'GET',
      url: '/api/talents/'
    });
    return talents;
  }

  async search(query) {
    const talents = await makeApiRequest({
      type: 'GET',
      url: `/api/talents?query=${query}`
    });
    return talents;
  }
}