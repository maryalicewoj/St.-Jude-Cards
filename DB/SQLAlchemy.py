from sqlalchemy import create_engine
from sqlalchemy import MetaData, Column, Table, ForeignKey
from sqlalchemy import Integer, String
import web
 
engine = create_engine('sqlite:///tutorial.db',
	echo=True)
 
metadata = MetaData(bind=engine)
 
users_table = Table('users', metadata,
	Column('firstName', Integer, primary_key=True),
	Column('lastName', String(40)),
	Column('userName', String),
	Column('password', String),
	Column('sex', String),
	Column('patient', String), #can I change this to a true or fase format?
	Column('age', Integer, nullable=False), # Range of Values .... I have it set up so that it is optional
	)
 
# create tables in database
metadata.create_all()





# insert new user, off of login page when submit is hit
# need checks and balances to make sure that everything is filled out

# create an Insert object
ins = users_table.insert()
# add values to the Insert object
# how do I reference the html text for the values??
form = web.input(name="Nobody", greet=None, )

#else:
#    return "ERROR: greet is required."
new_user = ins.values(name="Joe", age=20, password="pass")
 
# create a database connection
conn = engine.connect()
# add user to database by executing SQL
conn.execute(new_user)



url = (
  '/html_form_action.asp', 'Index'
  )

app = web.application(url, globals())

render = web.template.render('templates/')



# from offline
class Index:
    def GET(self):
        return render.hello_form()

# I don't know if I did the Post(self) function correctly
    def POST(self):
    	firstName = "%s" % (form.firstName)
    	lastName = "%s" % (form.lastName)
    	userName = "%s" % (form.userName)
    	password = "%s" % (form.password)
    	patient = "%s" % (form.patient)
    	sex = "%s" % (form.sex)
    	job = "%s" % (form.job)
    	age = "%s" % (form.age)


if __name__ == "__main__":
    app.run()
# sometimes ^ has issues, check if not running, idk if correct :|




print users_table
