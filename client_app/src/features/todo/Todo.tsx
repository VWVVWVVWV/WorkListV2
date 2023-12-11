import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import TodoModel from '../../models/Todo';
import GetParamModel from '../../models/Getparam';
import  LoginModel from "../../models/Login";
import  TodofinishModel from '../../models/Todofinish';
import  TodoeditModel from '../../models/Todoedit';
import { getTodosAsync,addTodoAsync,updTodoAsync,setpageTodoAsync,loginTodoAsync,logoutTodoAsync,finishTodoAsync,closeErrorTodoAsync} from './todoSlice';
import  {selectTodos,selectLogin,selectUpdate,selectSortType,selectSortField,selectPage,selectPages,selectError} from './todoSlice';


export function Todo() {

    const todos = useAppSelector(selectTodos); 
    const updFlag = useAppSelector(selectUpdate);
    const sort_type = useAppSelector(selectSortType)
    const sort_field = useAppSelector(selectSortField)
    const page = useAppSelector(selectPage)
    const pages = useAppSelector(selectPages)
    const token = useAppSelector(selectLogin)
    const error = useAppSelector(selectError)
    const dispatch = useAppDispatch();
    const [task_id, settask_id] = useState("")
    const [user, setuser] = useState("")
    const [email, setemail] = useState("")
    const [text, settext] = useState("") 
    const [edited, setedited] = useState(false) 
    const [finished, setfinished] = useState(false) 
    const [temp_page,settemppage]=useState(page) 
    const [temp_sort,settempsort]=useState(sort_type) 
    const [templogin,settemplogin]=useState("") 
    const [temppassword,settemppassword]=useState("")    
    const [flagadd,setflagadd]=useState(false)
    const [flogin,setflogin]=useState(false)

    const field_names=['task_id','user','email','text','edited','finished']

    const build_todos = () => {
        const temp_todo: TodoModel = { task_id, user, email, text,edited,finished}
        dispatch(addTodoAsync(temp_todo))        
    }    
    const upd_grade = (token:string,task_id:string,text:string) => {
        const temp_todo: TodoeditModel = { token, task_id, text}
        dispatch(updTodoAsync(temp_todo))
        settask_id("")
    }
    const finish = (token:string,task_id:string) => {
        const temp_todo: TodofinishModel = { token, task_id}
        dispatch(finishTodoAsync(temp_todo))
    }

    const get_todos = () => {
        const temp_param: GetParamModel = { page:temp_page,sort_type,sort_field}
        dispatch(getTodosAsync(temp_param))
    }   

    const get_token = () => {
        const temp_login: LoginModel = { login:templogin,password:temppassword}
        dispatch(loginTodoAsync(temp_login))
        setflogin(false)
        settemplogin("")
        settemppassword("")
    } 
    const del_token = () => {
        dispatch(logoutTodoAsync(token))
    }
    const closeError=()=>{
        dispatch(closeErrorTodoAsync())
    }       
    const setasc = (sort_field:string) => {
        settempsort(temp_sort => "asc")
        const temp_param: GetParamModel = { page:page,sort_type:"asc",sort_field:sort_field}
        dispatch(getTodosAsync(temp_param))        
    } 
    const setdesc = (sort_field:string) => {        
        settempsort(temp_sort => "desc")
        const temp_param: GetParamModel = { page:page,sort_type:"desc",sort_field:sort_field}
        dispatch(getTodosAsync(temp_param))        
    } 
    const prev_page = () => {
        if(page>1){ 
            settemppage(temp_page => page - 1)
            const temp_param: GetParamModel = { page:(temp_page-1),sort_type,sort_field}
            dispatch(getTodosAsync(temp_param))
        }
    };
    const next_page = () => {
        if(todos.length>0){
            settemppage(temp_page => page + 1)
            const temp_param: GetParamModel = { page:(temp_page+1),sort_type,sort_field}
            dispatch(getTodosAsync(temp_param))
        }
    };
    const print_field_type_sort = (name:string) =>{
        if (name==sort_field){
            return sort_type
        }
        else{
            return ''
        } 
    };

    const admin_panel_edit=(todo: TodoModel)=>{
        if (token!=''){
            return <button onClick={() => edit_todo(todo.task_id,todo.user,todo.email,todo.text)}>edit</button>
        }
        else{
            return ''
        }
    }
    const admin_panel_end_task=(todo: TodoModel)=>{
        if (token!=''){
            return <button onClick={() => finish(token,todo.task_id)}>task_end</button>
        }
        else{
            return ''
        }

    }    
    const edit_todo=(temp_task_id: string,temp_user: string,temp_email: string,temp_text: string)=>{
        settask_id(temp_task_id)
        setuser(temp_user)
        setemail(temp_email)
        settext(temp_text)
    }


    const open_edit_panel=()=>{
        if (token!='' && task_id!=''){
            return <div className="shadow">
                <div className="addeditWindow">
                <div>
                <h1> Editing panel</h1>
                <button onClick={() => upd_grade(token,task_id,text)}>update data</button> 
                <button onClick={() => settask_id("")}>Close</button>
                </div>
                <div className="field"><span >task_id:</span><span>&nbsp;</span><input disabled value={task_id}/></div>
                <div className="field"><span >name:</span><span>&nbsp;</span><input disabled  value={user}/></div>
                <div className="field"><span >email:</span><span>&nbsp;</span><input disabled  value={email} /></div>
                <div className="field"><span >text:</span><span>&nbsp;</span><input  onChange={(e) => settext(e.target.value)} value={text} /></div>            
                </div>
             </div>  
                      
        }
    }

    const open_add_panel=()=>{
        if((token=='' || task_id=='')&&flagadd){
            return <div className="shadow">
                <div className="addeditWindow"> 
                <div>
                <h1> Adding panel</h1>                
                <button onClick={() => build_todos()}>Add</button>
                <button onClick={() => setflagadd(false)}>Close</button>
                </div>
                <div>                
                <div className="field"><span>name:</span><input  onChange={(e) => setuser(e.target.value)} /></div>
                <div className="field"><span>email:</span><input  onChange={(e) => setemail(e.target.value)} /></div>
                <div className="field"><span>text:</span><input onChange={(e) => settext(e.target.value)}  /></div>                                               
                </div>
             </div></div>  
                      
        }
    }    
    const open_login_window=()=>{
        if(flogin){
        return <div className="shadow">
                <div className="loginWindow">
                    <div>Admin panel</div>
                    <hr></hr>
                    <div className="field"><label>Login:    <input onChange={(e) => settemplogin(e.target.value)} /></label></div>
                    <div className="field"><label>Password: <input onChange={(e) => settemppassword(e.target.value)} /></label></div>
                    <a href="#" onClick={() => get_token()} >Войти</a>
                </div>
            </div>
        }
    }
    const login_logout=()=>{
        if (token==''){
            return <button onClick={()=> setflogin(true)}>Login</button>
        }
        else{
            return <button onClick={() => del_token() }>Logout</button>
        }

    }    
    const errorWindow=()=>{
        if(error!=''){
            return <div className="shadow">
                        <div className="errorWindow">
                            <div className="err">{error}</div>
                            <hr></hr>
                            <button onClick={()=>closeError()}>Close</button>
                        </div>                
                    </div> 
        }

    }
    useEffect(() => {
        const temp_param: GetParamModel = { page,sort_type,sort_field}
        dispatch(getTodosAsync(temp_param))
    }, [updFlag])
    return (
        <div>
            <div>            
                <div className="Login">{login_logout()}</div>
            <hr></hr>
            <h1 className="Title">Todo</h1>
            </div>
            <div>
            <table >
                <thead>
                <tr>
                {field_names.map((field)=>
                    <th>
                        {field}
                    </th>
                )}
                <th><button onClick={() => setflagadd(true)}>Add</button></th>
                </tr>  
                </thead>              
                <tbody>
                <tr>
                {field_names.map(field=>
                    <td>
                        <button onClick={() => setdesc(field)}>&uarr;</button>            
                        <button onClick={() => setasc(field)}>&darr;</button> 
                        {print_field_type_sort(field)}
                    </td>                    
                 )}
                 <td></td>                     
                </tr>
                             
                {todos.map(todo=><tr><td>{todo.task_id}</td>
                                    <td>{todo.user}</td>
                                    <td>{todo.email}</td>
                                    <td>{todo.text}</td>
                                    <td><input type="checkbox" checked={todo.edited}></input></td>
                                    <td><input type="checkbox" checked={todo.finished}></input></td>
                                    <td>
                                        {admin_panel_edit(todo)}
                                        {admin_panel_end_task(todo)}                                                                               
                                    </td>                             
                               </tr>)}

                </tbody>
            </table>
            </div>            
            <br></br>            
            <button className="pagebutton" onClick={() => prev_page()}>prev page</button>
            <span>{page} of {pages}</span>
            <button className="pagebutton" onClick={() => next_page()}>next page</button>
            <hr></hr>
            {open_login_window()}
            {open_edit_panel()}
            {open_add_panel()}                    
            {errorWindow()} 
        </div>
    );
}