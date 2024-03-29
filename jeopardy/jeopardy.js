const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

async function getCategoryIds() {
  const response = await axios.get('https://rithm-jeopardy.herokuapp.com/api/categories', {
    params: { count: NUM_CATEGORIES }
  });
  return response.data.map(category => category.id);
}

async function getCategory(catId) {
    try {
      
      const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category`, {
        params: { id: catId }
      });
      return {
        title: response.data.title,
        clues: response.data.clues.slice(0, NUM_QUESTIONS_PER_CAT).map(clue => ({
          question: clue.question,
          answer: clue.answer,
          showing: null
        }))
      };
    } catch (error) {
      console.error("Failed to fetch category:", catId, error);
      return null; 
    }
  }

async function fillTable() {
    const thead = document.querySelector('#jeopardy thead tr');
    const tbody = document.querySelector('#jeopardy tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const categoryIds = await getCategoryIds();
    const categories = await Promise.all(categoryIds.map(id => getCategory(id)));

 
    const validCategories = categories.filter(category => category != null);

    validCategories.forEach(category => {
        const th = document.createElement('th');
        th.textContent = category.title;
        thead.appendChild(th);
    });

    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        const tr = document.createElement('tr');
        validCategories.forEach(category => {
            const td = document.createElement('td');
            if (category.clues[i]) {
                td.textContent = '?';
                td.dataset.question = category.clues[i].question;
                td.dataset.answer = category.clues[i].answer;
                td.dataset.showing = 'null';
                td.onclick = handleClick;
                tr.appendChild(td);
            }
        });
        if (tr.childNodes.length > 0) { 
            tbody.appendChild(tr);
        }
    }
}

function handleClick(event) {
  const td = event.target;
  if (td.dataset.showing === 'null') {
    td.textContent = td.dataset.question;
    td.dataset.showing = 'question';
  } else if (td.dataset.showing === 'question') {
    td.textContent = td.dataset.answer;
    td.dataset.showing = 'answer';
  }
}

function showLoading() {
  document.getElementById('start-button').disabled = true;
  document.getElementById('start-button').textContent = 'Loading...';
}

function hideLoading() {
  document.getElementById('start-button').disabled = false;
  document.getElementById('start-button').textContent = 'Start Game';
}

async function setupAndStart() {
  showLoading();
  await fillTable();
  hideLoading();
}

document.querySelector('#start-button').addEventListener('click', setupAndStart);