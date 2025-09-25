// 待办事项数据
let todos = [];
let currentFilter = 'all';

// DOM元素
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoItems = document.getElementById('todoItems');
const itemsLeft = document.getElementById('itemsLeft');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// 初始化应用
function initApp() {
    // 从本地存储加载数据
    loadTodos();
    
    // 渲染待办事项
    renderTodos();
    
    // 更新统计信息
    updateStats();
    
    // 添加事件监听器
    addEventListeners();
}

// 从本地存储加载待办事项
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// 保存待办事项到本地存储
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 添加事件监听器
function addEventListeners() {
    // 添加待办事项
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 过滤按钮点击事件
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            
            // 更新活跃按钮样式
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 重新渲染待办事项
            renderTodos();
        });
    });
    
    // 清除已完成按钮点击事件
    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// 添加新的待办事项
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text !== '') {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        todos.push(todo);
        saveTodos();
        renderTodos();
        updateStats();
        
        // 清空输入框
        todoInput.value = '';
    }
}

// 切换待办事项完成状态
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
    updateStats();
}

// 编辑待办事项
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newText = prompt('编辑待办事项:', todo.text);
    
    if (newText !== null && newText.trim() !== '') {
        todos = todos.map(t => {
            if (t.id === id) {
                return { ...t, text: newText.trim() };
            }
            return t;
        });
        
        saveTodos();
        renderTodos();
    }
}

// 删除待办事项
function deleteTodo(id) {
    if (confirm('确定要删除这个待办事项吗？')) {
        todos = todos.filter(todo => todo.id !== id);
        
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// 清除所有已完成的待办事项
function clearCompleted() {
    if (todos.some(todo => todo.completed)) {
        if (confirm('确定要清除所有已完成的待办事项吗？')) {
            todos = todos.filter(todo => !todo.completed);
            
            saveTodos();
            renderTodos();
            updateStats();
        }
    }
}

// 渲染待办事项列表
function renderTodos() {
    todoItems.innerHTML = '';
    
    // 根据当前过滤器筛选待办事项
    let filteredTodos = todos;
    
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    
    // 渲染筛选后的待办事项
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            </div>
        `;
        
        todoItems.appendChild(li);
        
        // 添加事件监听器
        const checkbox = li.querySelector('.todo-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        editBtn.addEventListener('click', () => editTodo(todo.id));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    });
}

// 更新统计信息
function updateStats() {
    const activeTodos = todos.filter(todo => !todo.completed);
    const count = activeTodos.length;
    
    itemsLeft.textContent = `${count} 项待办`;
}

// 页面加载时初始化应用
document.addEventListener('DOMContentLoaded', initApp);