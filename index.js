const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");

const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

getRandomMeal();
fetchfavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();

  const randomMeal = respData.meals[0];
  //   console.log(randomMeal);
  addMeal(randomMeal, true);
}
async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );
  const respData = await resp.json();
  const meal = respData.meals[0];
  return meal;
}
async function getMealsBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );
  const respData = await resp.json();
  const meals = respData.meals;
  return meals;
}
function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  mealsEl.classList.add("meal");
  meal.innerHTML = `<div class="meal-header">
    ${
      random
        ? `
    <span class="random"> Random Recipe </span>`
        : ""
    }
    <img class ="image"
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
    />
</div>
<div class="meal-body">
    <h4>${mealData.strMeal}</h4>
    <button class="fav-btn">
        <i class="fas fa-heart"></i>
    </button>
</div>`;

  mealsEl.appendChild(meal);
  const btn = meal.querySelector(".meal-body .fav-btn");
  const rand_btn = meal.querySelector(".random");
  rand_btn.addEventListener("click", () => {
    mealsEl.innerHTML = "";
    searchTerm.value = "";
    getRandomMeal();
  });
  const btn_img = document.querySelector(".image");
  // console.log(btn_img)
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealtoLS(mealData.idMeal);
      btn.classList.toggle("active");
    }
    fetchfavMeals();
  });
  btn_img.addEventListener("click", () => {
    showMealInfo(mealData);
  });
}
function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";

  // update the Meal info
  const mealEl = document.createElement("div");

  const ingredients = [];

  // get ingredients and measures
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
      <h1>${mealData.strMeal}</h1>
      <img
          src="${mealData.strMealThumb}"
          alt="${mealData.strMeal}"
      />
      <p>
      ${mealData.strInstructions}
      </p>
      <h3>Ingredients:</h3>
      <ul>
          ${ingredients
            .map(
              (ing) => `
          <li>${ing}</li>
          `
            )
            .join("")}
      </ul>
  `;

  mealInfoEl.appendChild(mealEl);

  // show the popup
  mealPopup.classList.remove("hidden");
}
function addMealtoLS(mealId) {
  const mealIds = getMealsFromLs();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}
function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLs();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}
function getMealsFromLs() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  return mealIds === null ? [] : mealIds;
}
async function fetchfavMeals() {
  // clean container
  favoriteContainer.innerHTML = "";
  const mealIds = getMealsFromLs();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addMealtoFav(meal);
  }
}

function addMealtoFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
    <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
    /><span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
`;

  const btn = favMeal.querySelector(".clear");

  btn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);

    fetchfavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favoriteContainer.appendChild(favMeal);
}

searchBtn.addEventListener("click", async () => {
  mealsEl.innerHTML = "";
  // searchTerm.value = '';
  if (searchTerm.value !== "") {
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);
    if (meals) {
      meals.forEach((meal) => {
        addMeal(meal, true);
      });
    }
  } else {
    getRandomMeal();
  }
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
