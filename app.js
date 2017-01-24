// ==================================================
// Budget Controller
// ==================================================
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcPercentage = function(totalIncome) {
		
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome)*100);
		} else {
			this.percentage = -1;
		}
		
	};
	
	Expense.prototype.getPercentage = function() {
		
		return this.percentage;
		
	};
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	var calculateTotal = function(type) {
		
		var sum = 0;
		
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};
	
	
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	
	return {
		addItem: function(type, des, val) {
			var newItem,ID;
			
			// New ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0;
			}
			
			// New Item
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else {
				newItem = new Income(ID, des, val);
			}
			
			// Push new Item
			data.allItems[type].push(newItem);

			// Return new Item
			return newItem;
		},
		
		deleteItem: function(type, id) {
			
			var index, ids;
			
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			
			index = ids.indexOf(id);
			
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			} 
			
		},
		
		calculateBudget: function() {
			
			// calculate total income and expensesContainer
			calculateTotal('exp');
			calculateTotal('inc');
			
			// calculate the budget: income - expensesContainer
			data.budget = data.totals.inc - data.totals.exp;
			
			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
			} else {
				data.percentage = -1;
			}
			
		},
		
		calculatePercentages: function() {
			
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
			
		},
		
		getPercentages: function() {
			
			var allPercentages = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			
			return allPercentages;
			
		},
		
		getBudget: function() {
			
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
			
		},
		
		testing: function() {
			console.log(data);
		}
	};

})();

// ==================================================
// User Interface Controller
// ==================================================
var UIController = (function() {
	
	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	
	var formatNumber = function(num, type) {
			
			var numSplit, integer, decimal, type;
			
			num = Math.abs(num);
			num = num.toFixed(2);
			
			numSplit = num.split('.');
			
			integer = numSplit[0];
			if (integer.length>3) {
				integer = integer.substr(0,integer.length-3) + ',' + integer.substr(integer.length-3,3); 
			}
			decimal = numSplit[1];
						
			return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + integer + '.' + decimal;
	};
	
	var nodeListForEach = function(list, callback) {
				
				for (var i =0; i<list.length; i++) {
					callback(list[i], i);
				}
				
	};
	
	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // va fi "inc" sau "exp"
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};	
		},
		
		addListItem: function(obj, type) {
			
			var html, newHTML,newElement;
			// Create html string with placeholder
			if (type === 'inc') {
				
				newElement = DOMStrings.incomeContainer;
				
			html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else {
				
				newElement = DOMStrings.expensesContainer;
				
			html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			// Replace placeholder text with actual data
			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
			// Insert html into dom
			document.querySelector(newElement).insertAdjacentHTML('beforeend', newHTML);
			
		},
		
		deleteListItem: function(selectorId) {
			
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
			
		},
		
		clearFields: function() {
			
			var fields, fieldsArray;
			
			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
			fieldsArray = Array.prototype.slice.call(fields);
			
			fieldsArray.forEach(function(current, index, array) {
				current.value = "";
			});
			
			fieldsArray[0].focus();
		},
		
		displayBudget: function(obj) {
			
			var type;
			
			obj.budget > 0 ? type='inc' : type='exp';
			
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			
			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '- %';
			}
			
		},
		
		displayPercentages: function(percentages) {
			
			var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
			
			nodeListForEach(fields, function(current, index) {
				
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '- %';
				}
			});
			
		},
		
		displayMonth: function() {
			
			var now, year, month, months;
			
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
			
		},
		
		changeType: function() {
			
			var fields = document.querySelectorAll(
				DOMStrings.inputType + ',' +
				DOMStrings.inputDescription + ',' +
				DOMStrings.inputValue);
				
			nodeListForEach(fields, function(cur) {
				
				cur.classList.toggle('red-focus');
				
			});
			
			document.querySelector(DOMStrings.inputButton).classList.toggle('red');
			
		},
		
		getDOMStings: function() {
			return DOMStrings;
		}
	};
	
})();


// ==================================================
// Application Controller
// ==================================================
var controller = (function(budgetCtrl, UICtrl) {
	
	var setEventListeners = function() {
		
		var DOM = UICtrl.getDOMStings();
		
		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
	
		document.addEventListener('keypress', function(event) {
			
			if (event.keyCode === 13 || event.which === 13) {
				
				ctrlAddItem();
				
			}
			
		});
		
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};
	
	var updateBudget = function() {
		
		// 1. Calculate new budget
		budgetCtrl.calculateBudget();
		
		// 2. Return the budget
		var budget = budgetCtrl.getBudget();
		
		// 3. Display budget
		UICtrl.displayBudget(budget);
		
	};
	
	var updatePercenteges = function() {
		
		// calc percentage
		budgetCtrl.calculatePercentages();
		// read them from budget controller
		var percentages = budgetCtrl.getPercentages();
		// update UI
		UICtrl.displayPercentages(percentages);
	};
	
	
	var ctrlAddItem = function() {
		
		var input, newItem;
		
		// 1. Get the field input data
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
		// 2. Add item to the budget controller
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		
		// 3. Add new item to the UIController
		UICtrl.addListItem(newItem, input.type);
		
		// 3'. Clear Fields
		UICtrl.clearFields();
		
		// 4. Calc and update budget
		updateBudget();
		
		// update percentages
		updatePercenteges();
		
		}

	};
	
	var ctrlDeleteItem = function(event) {
		
		var splitID, itemID, type, ID;
		
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if (itemID) {
			
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			// Delete item from data
			budgetCtrl.deleteItem(type, ID);
			
			// Delete item from UIController
			UICtrl.deleteListItem(itemID);
			
			// Update and show new budget
			updateBudget();
			
			// update percentages
			updatePercenteges();

			
		}
		
	};
	
	return {
		init: function() {
			console.log('test');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setEventListeners();
		}
	}
	
	
})(budgetController, UIController);

controller.init();