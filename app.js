// BUDGET CONTROLLER    
var budgetController = (function(){
    
    var Income = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Expenses = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expenses.prototype.calcPerc = function (totalIncome){
      
        if(totalIncome > 0){
        this.percentage = Math.round((this.value/totalIncome)*100);
        } else {
            this.percentage = -1;
        }
        
    };
    
    Expenses.prototype.getPercentage = function () { 
        return this.percentage;
    };
    
    var Data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
        
    };
    
    return {
        addItems: function (type,des,val) {
            var newItem, ID;
            
            if (Data.allItems[type].length > 0){
                ID = Data.allItems[type][Data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            
            if (type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            else if (type === 'exp'){
                newItem = new Expenses(ID,des,val);
            }
            else {
                console.log("Problem in adding newitem.");
            }
            
            Data.allItems[type].push(newItem);
    
            return newItem;
        },
        
        deleteItem: function (type,id) {
           var idArr,index ;
           idArr = Data.allItems[type].map(function (current){
               return current.id;
           });
            index = idArr.indexOf(id);
            
            if(index !== -1){
                Data.allItems[type].splice(index,1);
            }
            
            
       },
        
        calculateTotal: function(type) {
            var sum = 0;
            Data.allItems[type].forEach(function(cur){
                sum += cur.value;
            });
            
            Data.totals[type] = sum;
            
            Data.budget = Data.totals.inc - Data.totals.exp;
            
            if(Data.totals.inc !== 0){
            Data.percentage = Math.round((Data.totals.exp/Data.totals.inc)*100);
            }
            else {
                Data.percentage = -1;
            }
            
        },
        
        getBudget: function(){          
            return {
                budget: Data.budget,
                percentage:Data.percentage,
                income: Data.totals.inc,
                expense: Data.totals.exp
            };
            
        },
        
        calculatePercentages: function () {
          
            Data.allItems.exp.forEach(function(cur){
                cur.calcPerc(Data.totals.inc);
            });
            
        },
        
        getPercentages: function () {
            
           var percArr = Data.allItems.exp.map(function (cur){
                return cur.getPercentage(); 
            });
            
            return percArr;
            
        },
        
        getData: function (){
            return Data;
        }
        
        
    };
    
    
    
})();

var UIController = (function (){
    
    var DOMString = {
        inputType : '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expenses--value',
        totalBudget:'.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel:'.budget__title--month'
    };
    
    var formatNumber = function (num, type){
       var numSplit,int,dec;
        
        num = Math.abs(num);
        // 2356.5626 2500
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        
        if (int.length > 3){
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }
        
       return (type === 'inc'? '+ ': '- ') + int + '.' + dec ;
    } ;
    
    var nodeListForEach = function (list,callback){
               for (var i =0; i< list.length; i++){
                   callback(list[i],i)
               }
    };
    
    
   return {
       
       // to receive data from input and through input Object.
       getInput : function () {
           return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value) 
           };
       },
       
       // to get DOMString or element from html
       getDOMString: function() {
           return DOMString;
       },
       
       // to insert new Listitem to console
       addListItem: function(item,type){
            var element, oldhtml, newhtml;
           
            // add placeholder
            if (type === 'inc'){
                element = DOMString.incomeList;
                oldhtml = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
           else if (type === 'exp'){
               element = DOMString.expenseList;
               oldhtml = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
           
            // replace placeholder
            newhtml = oldhtml.replace('%id%', item.id);
            newhtml = newhtml.replace('%description%', item.description);
            newhtml = newhtml.replace('%value%',formatNumber(item.value,type));
           
            // insert html to DOM
           document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
            
       },
       
       deleteListItem : function (selectorID) {
           
           var elementtodelete = document.getElementById(selectorID);
           elementtodelete.parentNode.removeChild(elementtodelete);
           
       },
       
       
       // clear the field 
       clearFields: function () {
           
           var listFieldsToDelete = document.querySelectorAll(DOMString.inputDescription + ',' + DOMString.inputValue);
           
           // using call method on Array prototype to convert list into array
           var fieldsArr = Array.prototype.slice.call(listFieldsToDelete);
           // each item using foreach loop
           fieldsArr.forEach(function (current,index,entireArray) {
               current.value = "";
           });
           
           fieldsArr[0].focus();
           
        },
       
       displayPercentage: function(percArr){
         
           var fields = document.querySelectorAll(DOMString.expensePercLabel);
           
            
           
           nodeListForEach(fields,function(current,index){
              
               if (percArr[index]>0){
                   current.textContent = percArr[index] + '%';
               }
               else {
                   current.textContent = '--';
               }
           });
           
       },
       
       displayDate: function(){
            var now , month, year;
           
           var months = ['Jan','Feb','Mar','Apr','May','June', 'July','Aug','Sept','Oct','Nov','Dec'];
           
           now = new Date();
           month = now.getMonth();
           year = now.getFullYear();
           
           document.querySelector(DOMString.dateLabel).textContent = months[month]+' '+ year;
       },
       
       displayBudget: function (budgetData) {
           var typePlus = 'inc';
           var typeMinus = 'exp';
           
        document.querySelector(DOMString.totalIncome).textContent = formatNumber(budgetData.income, typePlus);
        document.querySelector(DOMString.totalExpense).textContent = formatNumber(budgetData.expense,typeMinus);
           
           if (budgetData.budget >= 0){
               document.querySelector(DOMString.totalBudget).textContent =  formatNumber(budgetData.budget,typePlus);
           }
           else {
               document.querySelector(DOMString.totalBudget).textContent = formatNumber(budgetData.budget,typeMinus);
           }
           
           if (budgetData.percentage > 0)
                document.querySelector(DOMString.percentageLabel).textContent = budgetData.percentage+ '%';
           else 
               document.querySelector(DOMString.percentageLabel).textContent = '--';
        
       },
       
       changeStyles: function (){
           
           var fields = document.querySelectorAll(
               DOMString.inputType + ',' + 
               DOMString.inputDescription + ',' +
               DOMString.inputValue
           );
           
           nodeListForEach(fields,function(cur){
               cur.classList.toggle('red-focus');
           });
           
           document.querySelector(DOMString.inputBtn).classList.toggle('red');
       }
       
       
       
   };
    
   
    
    
})();

// Whole APP Controller

var Controller = (function(budgetCtrl,UICtrl){
    
    var DOMString = UICtrl.getDOMString();
    
    var setupEventListeners = function () {

        

        document.querySelector(DOMString.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });
        
        document.querySelector(DOMString.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOMString.inputType).addEventListener('change',UICtrl.changeStyles);

    };
    
    
    var updateBudget = function (type) {
       
        // calculate the budget
        budgetCtrl.calculateTotal(type);
        
        // return the budget
        var budgetData = budgetCtrl.getBudget();
        
        // display in UI
        UICtrl.displayBudget(budgetData);
        
    };
    
    var updatePercentages = function (){
        //calculate the percentages
        budgetCtrl.calculatePercentages();
        
        //get the percentages from budgetController
         var percArr = budgetCtrl.getPercentages();
         
        
        //display the percentages on UI
        UICtrl.displayPercentage(percArr);
    };
    
    var ctrlAddItem = function () {
       
        // getting input from user;
        var input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            // save the data i.e. add the item and create a list item
        var newData = budgetCtrl.addItems(input.type,input.description,input.value);
        
        // add Listitem to UI
        UICtrl.addListItem(newData,input.type);
        
        // clearing content of input box after button press
        UICtrl.clearFields();
        
        // update the budget
        updateBudget(input.type);
            
        // update the percentages and display
        updatePercentages();
            
        }     
     };
    
    var ctrlDeleteItem = function (event) {
        var itemID,itemArr,type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            itemArr = itemID.split('-');
            type = itemArr[0];
            ID = parseInt(itemArr[1]);
            
            // delete the item from data structure
            budgetCtrl.deleteItem(type,ID);
            
            // delete the items from ui
            UICtrl.deleteListItem(itemID);
            
            
            // update and show the budget
            updateBudget(type);
            
            // update the percentages and display
            updatePercentages();
        }
        
        
    }
    
    
    return {
        
        initGame: function () {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                percentage:-1,
                income: 0,
                expense: 0
            });
            setupEventListeners();
            
        }
    };

    
    
    
})(budgetController,UIController);

Controller.initGame();
