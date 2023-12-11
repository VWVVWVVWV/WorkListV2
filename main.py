import asyncio
import random
import re
import functools
from flask import Flask, request
from flask_cors import CORS

from sqlalchemy import Column, Integer, String, Boolean, func as sqlfunc
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import text as sqltxt


app = Flask(__name__)
CORS(app)

engine = create_async_engine('sqlite+aiosqlite:///./tasks.db')
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()

admin_sessions = set()


def check_empty_string(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        for arg in args:
            if type(arg) is str:
                if arg == '':
                    raise Exception("Empty string found")
        return result
    return wrapper


def simple_error_wrapper(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
        except Exception as e:
            result = 'Error: ' + str(e)
        return result
    return wrapper


async def testeditright(token):
    if str(token) not in admin_sessions:
        raise Exception("You are not authorized to perform this action.")
    return True


class Task(Base):
    __tablename__ = 'tasks'
    task_id = Column(Integer, primary_key=True)
    user = Column(String)
    email = Column(String)
    text = Column(String)
    edited = Column(Boolean)
    finished = Column(Boolean)

    @check_empty_string
    def __init__(self, user: str, email: str, text: str, edited: bool = False, finished: bool = False):
        self.user = user
        self.email = self.checkemail(email)
        self.text = text
        self.edited = edited
        self.finished = finished

    def get_dict(self):
        return {attr: val for attr, val in self.__dict__.items() if attr[:1] != '_'}

    @classmethod
    def get_fields(cls):
        return [i for i in cls.__dict__.keys() if i[:1] != '_']

    @staticmethod
    def checkemail(test_email: str, variant: str = 'simple') -> str:
        regexps = {
            'simple': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
            'rfc5322': "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])"
        }
        regex = regexps[variant] if variant in regexps else regexps['simple']
        if not re.fullmatch(regex, test_email):
            raise Exception("InValid Email")
        return test_email


async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Task.metadata.drop_all)
        await conn.run_sync(Task.metadata.create_all)


@app.async_to_sync
async def on_startup():
    await init_tables()
on_startup()


@app.route('/')
async def index():
    await asyncio.sleep(2)
    return 'Web App with Python Flask!'


@app.route('/tasks', methods=['POST'])
async def tasks() -> dict:
    sort_type = "desc"
    task_page = 1
    sort_field = 'task_id'
    if request.method == 'POST':
        task_page = request.get_json().get('page', 1)
        sort_type = request.get_json().get('sort_type', "asc")
        sort_field = request.get_json().get('sort_field', "task_id")
        if type(task_page) is not int:
            task_page = 1
        elif task_page < 1:
            task_page = 1
    fields = Task.get_fields()
    offset = (task_page-1)*3
    sort_field = "task_id" if sort_field not in fields else sort_field
    sort_type = 'asc' if sort_type != 'desc' else 'desc'
    async with async_session() as session:
        query = await session.execute(select(Task).order_by(sqltxt(sort_field + ' '+sort_type)).limit(3).offset(offset))
        result = query.scalars().all()
        query2 = await session.execute(select(sqlfunc.count()).select_from(Task))
        result2 = query2.scalars().first()
        if type(result2) is int:
            pages = result2//3
            pages = (pages+1)if (pages % 3) > 0 else pages
    return {'sort_type': sort_type, 'sort_field': sort_field,
            'task_page': task_page, 'pages': pages,
            'todos': [record.get_dict() for record in result]}


@app.route('/new', methods=['POST'])
@simple_error_wrapper
async def new() -> str:
    resp = 'err'
    if request.method == 'POST':
        user = request.get_json().get('user', "")
        email = request.get_json().get('email', "")
        text = request.get_json().get('text',  "")
        task = Task(user, email, text)
        async with async_session() as session:
            session.add(task)
            await session.commit()
        resp = ''
    return resp


@app.route('/edit_task', methods=['POST'])
@simple_error_wrapper
async def edit_task() -> str:
    resp = 'err'
    if request.method == 'POST':
        task_id = request.get_json().get('task_id', "")
        text = request.get_json().get('text', "")
        edited = True
        token = request.get_json().get('token', "")
        edit_right = await testeditright(token)
        if edit_right:
            async with async_session() as session:
                query = await session.execute(select(Task).where(Task.task_id == int(task_id)))
                task = query.scalars().first()
                task.text = text
                task.edited = edited
                await session.commit()
            resp = ''
    return resp


@app.route('/finish', methods=['POST'])
@simple_error_wrapper
async def finish() -> str:
    resp = 'err'
    if request.method == 'POST':
        task_id = request.get_json().get('task_id', "")
        finished = True
        token = request.get_json().get('token', "")
        edit_right = await testeditright(token)
        if edit_right:
            async with async_session() as session:
                query = await session.execute(select(Task).where(Task.task_id == int(task_id)))
                task = query.scalars().first()
                task.finished = finished
                await session.commit()
            resp = ''
    return resp


@app.route('/login', methods=['POST'])
async def login() -> str:
    token = ''
    if request.method == 'POST':
        user = str(request.get_json().get('login', ""))
        password = str(request.get_json().get('password', ""))
        if user == 'admin' and password == '123':
            token = hex(random.randrange(pow(2, 255), pow(2, 256)))[2:]
            admin_sessions.add(token)
        else:
            token = ''
    return token


@app.route('/logout', methods=['POST'])
async def logout() -> str:
    if request.method == 'POST':
        token = str(request.get_json().get('token', ""))
        if token in admin_sessions:
            admin_sessions.remove(token)
    return ''

app.run(host='0.0.0.0', port=82, debug=True)
