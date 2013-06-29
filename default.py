from flask import flask, render_template

APP = Flask(__name__)

@APP.route("/")
def show_index():
    return render_template('Homepage.html')

if __name__ == "__main__":
    APP.run(host='0.0.0.0, port=int(environ["PORT"]))
