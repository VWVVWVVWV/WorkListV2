import { createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { RootState } from '../../store';
import  Todo  from '../../models/Todo';
import  GetParam  from '../../models/Getparam';
import  Login  from '../../models/Login';
import  Todofinish from '../../models/Todofinish';
import  Todoedit from '../../models/Todoedit';
import { getTodos,addTodo,updTodo,finishTodo,loginTodo,logoutTodo } from './todoAPI';


export interface TodoState {
    todos: Todo[]
    updateFlag:boolean
    page: number
    pages: number
    sort_type: string
    sort_field: string
    token: string
    error: string   
}

const initialState: TodoState = {
    todos: [],
    updateFlag: false,
    page: 1,
    pages: 1,
    sort_type: "desc",
    sort_field: "task_id",
    token: "",
    error: ""
};



export const getTodosAsync = createAsyncThunk(
    'todo/getTodos',
    async (select_param: GetParam) => {    
            const response = await getTodos(select_param);
            return response.data
    }
);


export const updTodoAsync = createAsyncThunk(
    'todo/updTodo',
    async (new_todo: Todoedit) => {
        const response = await updTodo(new_todo);
        return response.data;
    }
);

export const finishTodoAsync = createAsyncThunk(
    'todo/finishTodo',
    async (new_todo: Todofinish) => {
        const response = await finishTodo(new_todo);
        return response.data;
    }
);



export const addTodoAsync = createAsyncThunk(
    'todo/addTodo',
    async (new_todo: Todo) => {        
            const response = await addTodo(new_todo);            
            return response.data
    }
);

export const setpageTodoAsync = createAsyncThunk(
    'todo/setpage',
    async (newpage: number) => {
        const response =  newpage
        return response;
    }
);
export const changeSortTodoAsync = createAsyncThunk(
    'todo/changesort_type',
    async (new_sort: string)  => {
        const response = new_sort;
        return response;
    }
);

export const loginTodoAsync = createAsyncThunk(
    'todo/loginTodo',
    async (new_login: Login)  => {
        const response = await loginTodo(new_login);
        return response.data;
    }
);

export const logoutTodoAsync = createAsyncThunk(
    'todo/logoutTodo',
    async (token:string)  => {
        const response = await logoutTodo(token);
        return response.data;
    }
);

export const closeErrorTodoAsync =createAsyncThunk(    
    'todo/closeErrorTodo',
    async ()  => {
        const response = '';
        return response;
    }
);

export const todoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getTodosAsync.fulfilled, (state, action) => {
                  state.todos = action.payload.todos;
                  if(state.page != action.payload.task_page){
                    state.updateFlag =! true;
                  }
                  state.page = action.payload.task_page
                  state.pages = action.payload.pages
                  state.sort_type = action.payload.sort_type
                  state.sort_field = action.payload.sort_field
            }).addCase(addTodoAsync.fulfilled, (state, action) => {
                  state.updateFlag =! state.updateFlag;
                  state.error=action.payload;
            }).addCase(updTodoAsync.fulfilled, (state, action) => {
                  state.updateFlag =! state.updateFlag;                  
                  state.error=action.payload;
            }).addCase(finishTodoAsync.fulfilled, (state, action) => {
                  state.updateFlag =! state.updateFlag;
                  state.error=action.payload;
            }).addCase(setpageTodoAsync.fulfilled, (state, action) => {
                  state.updateFlag =! state.updateFlag;
            }).addCase(changeSortTodoAsync.fulfilled, (state, action) => {                
                  state.updateFlag =! state.updateFlag;
            }).addCase(loginTodoAsync.fulfilled, (state, action) => {              
                  state.updateFlag =! state.updateFlag;
                  state.token=action.payload;
                  if(action.payload==""){
                   state.error="Error: Login error"
                  }
                  else{
                    state.error=""
                  }
            }).addCase(logoutTodoAsync.fulfilled, (state, action) => {
                  state.updateFlag =! state.updateFlag;
                  state.token=action.payload;
                  state.error=""
            }).addCase(closeErrorTodoAsync.fulfilled, (state, action) => {
                  state.updateFlag =! state.updateFlag;
                  state.error=action.payload;
            });

    },
});

export const selectTodos = (state: RootState) => state.todo.todos;
export const selectUpdate = (state: RootState) => state.todo.updateFlag;
export const selectSortType = (state: RootState) => state.todo.sort_type;
export const selectSortField = (state: RootState) => state.todo.sort_field;
export const selectPage = (state: RootState) => state.todo.page;
export const selectPages = (state: RootState) => state.todo.pages;
export const selectLogin = (state: RootState) => state.todo.token;
export const selectError = (state: RootState) => state.todo.error;
export default todoSlice.reducer;