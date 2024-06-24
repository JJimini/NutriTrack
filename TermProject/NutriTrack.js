let currentNutritionIndex = 0;
let nutritionItems = [];
let currentRecipeIndex = 0;
let recipes = [];

function createResultHtml(title, details) {
    return `
        <h2>${title}</h2>
        ${details}
    `;
}

function fetchData(url, parseResponse, handleResult) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            parseResponse(data);
            handleResult();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('result').innerHTML = '<p>데이터를 가져오는 중 오류가 발생했습니다.</p>';
        });
}

function parseNutritionResponse(data) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, "application/xml");
    nutritionItems = Array.from(xml.getElementsByTagName('item'));

    const foodName = document.getElementById('foodName').value.trim();

    nutritionItems = nutritionItems.sort((a, b) => {
        const aName = a.getElementsByTagName('DESC_KOR')[0].textContent;
        const bName = b.getElementsByTagName('DESC_KOR')[0].textContent;
        if (aName === foodName) return -1;
        if (bName === foodName) return 1;
        return aName.localeCompare(bName);
    });

    currentNutritionIndex = 0;
    if (nutritionItems.length > 0) {
        displayNutrition();
        document.getElementById('nutritionPagination').style.display = 'block';
    } else {
        document.getElementById('result').innerHTML = '<p>해당 영양 정보를 찾을 수 없습니다.</p>';
        document.getElementById('nutritionPagination').style.display = 'none';
    }
}

function displayNutrition() {
    if (nutritionItems.length > 0) {
        const item = nutritionItems[currentNutritionIndex];
        const descKor = item.getElementsByTagName('DESC_KOR')[0].textContent;
        const servingWt = item.getElementsByTagName('SERVING_WT')[0].textContent;
        const nutrCont1 = item.getElementsByTagName('NUTR_CONT1')[0].textContent;
        const nutrCont2 = item.getElementsByTagName('NUTR_CONT2')[0].textContent;
        const nutrCont3 = item.getElementsByTagName('NUTR_CONT3')[0].textContent;
        const nutrCont4 = item.getElementsByTagName('NUTR_CONT4')[0].textContent;
        const nutrCont5 = item.getElementsByTagName('NUTR_CONT5')[0].textContent;
        const nutrCont6 = item.getElementsByTagName('NUTR_CONT6')[0].textContent;

        const details = `
            <p>제공량: ${servingWt}g</p>
            <p>열량: ${nutrCont1}kcal</p>
            <p>탄수화물: ${nutrCont2}g</p>
            <p>단백질: ${nutrCont3}g</p>
            <p>지방: ${nutrCont4}g</p>
            <p>당류: ${nutrCont5}g</p>
            <p>나트륨: ${nutrCont6}mg</p>
        `;
        const resultHtml = createResultHtml(descKor, details);

        document.getElementById('result').innerHTML = resultHtml;
        document.getElementById('nutritionPagination').style.display = 'block';
    } else {
        document.getElementById('result').innerHTML = '<p>해당 영양 정보를 찾을 수 없습니다.</p>';
        document.getElementById('nutritionPagination').style.display = 'none';
    }
}

function parseRecipeResponse(data) {
    recipes = JSON.parse(data).COOKRCP01.row;
    currentRecipeIndex = 0;
    if (recipes.length > 0) {
        displayRecipe();
        document.getElementById('recipePagination').style.display = 'block';
    } else {
        document.getElementById('result').innerHTML = '<p>해당 레시피 정보를 찾을 수 없습니다.</p>';
        document.getElementById('recipePagination').style.display = 'none';
    }
}

function displayRecipe() {
    if (recipes.length > 0) {
        const item = recipes[currentRecipeIndex];
        const rcpNm = item.RCP_NM;
        const rcpPartsDtls = item.RCP_PARTS_DTLS;
        const manuals = Array.from({ length: 20 }, (_, i) => {
            const num = String(i + 1).padStart(2, '0');
            const manual = item[`MANUAL${num}`];
            const manualImg = item[`MANUAL_IMG${num}`] ? `<img src="${item[`MANUAL_IMG${num}`]}" alt="레시피 이미지" class="recipe-img">` : '';
            return manual ? `<tr><td>${manual}</td><td>${manualImg}</td></tr>` : '';
        }).join('');

        const details = `
            <p>재료: ${rcpPartsDtls}</p>
            <table>
                <thead>
                    <tr>
                        <th>내용</th>
                        <th>이미지</th>
                    </tr>
                </thead>
                <tbody>
                    ${manuals}
                </tbody>
            </table>
        `;
        const resultHtml = createResultHtml(rcpNm, details);

        document.getElementById('result').innerHTML = resultHtml;
        document.getElementById('recipePagination').style.display = 'block';
    } else {
        document.getElementById('result').innerHTML = '<p>해당 레시피 정보를 찾을 수 없습니다.</p>';
        document.getElementById('recipePagination').style.display = 'none';
    }
}

function nextNutrition() {
    if (currentNutritionIndex < nutritionItems.length - 1) {
        currentNutritionIndex++;
        displayNutrition();
    }
}

function prevNutrition() {
    if (currentNutritionIndex > 0) {
        currentNutritionIndex--;
        displayNutrition();
    }
}

function nextRecipe() {
    if (currentRecipeIndex < recipes.length - 1) {
        currentRecipeIndex++;
        displayRecipe();
    }
}

function prevRecipe() {
    if (currentRecipeIndex > 0) {
        currentRecipeIndex--;
        displayRecipe();
    }
}

function fetchNutrition() {
    const foodName = document.getElementById('foodName').value;
    if (!foodName.trim()) {
        alert('식품 이름을 입력하세요.');
        return;
    }
    const serviceKey = 'API KEY';
    const url = `API URL`;

    document.getElementById('recipePagination').style.display = 'none';
    document.getElementById('result').innerHTML = '';

    fetchData(url, parseNutritionResponse, displayNutrition);
}

function fetchRecipe() {
    const foodName = document.getElementById('foodName').value;
    if (!foodName.trim()) {
        alert('식품 이름을 입력하세요.');
        return;
    }
    const keyId = 'API KEY';
    const url = `API URL`;

    document.getElementById('nutritionPagination').style.display = 'none';
    document.getElementById('result').innerHTML = '';

    fetchData(url, parseRecipeResponse, displayRecipe);
}

function clearResults() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('nutritionPagination').style.display = 'none';
    document.getElementById('recipePagination').style.display = 'none';
    document.getElementById('foodName').value = '';
}
