from flask import Flask, jsonify, Response, request, session, make_response, redirect
from flask_cors import CORS
import requests
import logging
from models import db, User, Stock, Portfolio, PortfolioStock
from sqlalchemy.pool import NullPool
import oracledb
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Sequence
import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["https://tristancapstonepr.storage.googleapis.com"]) 
app.config['SESSION_COOKIE_SECURE'] = True
app.config['REMEMBER_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SECRET_KEY'] = 'mysecretkey'
app.config['SQLALCHEMY_ECHO'] = True


ALPHA_VANTAGE_API_KEY = 'ZBD3QIPITMQNSPPF'
app.secret_key = 'mysecretkey'

un = 'myownsh'
pw = 'AaZZ0r_cle#1'
dsn = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=g94a0d92b10bb94_p1plm1xfn2614jm8_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'

pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)

app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}
db.init_app(app)



@app.route('/login', methods=['POST'])
def login():
    """
    Endpoint for user login.

    This endpoint receives a POST request with JSON data containing the user's
    username and password. It checks if the provided username and password match
    a user in the database. If the login is successful, it stores the user's ID
    in the session and returns a JSON response with a success message and the user's ID.
    If the login fails, it returns a JSON response with an error message.

    Returns:
        A JSON response with a success message and the user's ID if the login is successful.
        A JSON response with an error message if the login fails.
        A JSON response with an error message if an exception occurs during the login process.
    """
    try:
        data = request.json
        username = data.get('NAME')
        password = data.get('PASSWORD_HASH')  

        user = User.query.filter_by(NAME=username).first()

        if user and user.check_password(password):  
            session['USER_ID'] = user.USER_ID  # Correctly store user ID in session
            return jsonify({'message': 'Login successful', 'USER_ID': user.USER_ID}), 200
        else:
            return jsonify({'message': 'Invalid username or password'}), 401
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({'message': 'An error occurred'}), 500


@app.route('/signup', methods=['POST'])
def signup():
    """
    Sign up a new user.

    This function handles the POST request to '/signup' endpoint and creates a new user in the database.

    Returns:
        A JSON response containing a success message and status code 201 if the user is created successfully.
        A JSON response containing an error message and status code 409 if the user already exists.
        A JSON response containing an error message and status code 500 if an error occurs during the process.
    """
    try:
        data = request.json
        email = data.get('EMAIL')
        username = data.get('NAME')
        password = data.get('PASSWORD_HASH')
        existing_user = User.query.filter_by(NAME=username).first()
        if existing_user:
            return jsonify({'message': 'User already exists'}), 409
        new_user = User(NAME=username)
        seq_val = db.session.execute(Sequence('user_id_seq'))
        new_user.USER_ID = seq_val
        new_user.EMAIL = email
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({'message': 'An error occurred'}), 500


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    """
    Logout the user.

    This function handles the '/logout' route and logs out the user by removing their session data and expiring the session cookie.

    Returns:
        A tuple containing the response object and the HTTP status code.
        - If the user is logged in, the response object will contain a JSON message indicating successful logout and the status code will be 200.
        - If the user is not logged in, the response object will contain a JSON message indicating that the user is not logged in and the status code will be 401.
    """
    if 'USER_ID' in session:
        session.pop('USER_ID', None)
        response = make_response(jsonify({'message': 'Logout successful'}))
        response.set_cookie('session', '', expires=0)  # Set the session cookie to expire immediately
        return response, 200
    else:
        return jsonify({'message': 'User is not logged in'}), 401


@app.route('/api/portfolio/add', methods=['POST'])
def add_stock_to_portfolio():
    """
    Add a stock to the user's portfolio.

    This function handles the POST request to add a stock to the user's portfolio.
    It retrieves the stock details from Alpha Vantage API, checks if the user is logged in,
    creates a new stock entry if it doesn't exist, creates a new portfolio if it doesn't exist,
    updates the quantity of the stock in the portfolio, and returns a JSON response with the updated quantity.

    Returns:
        A JSON response with the following keys:
        - 'message': A message indicating the success of the operation.
        - 'updated_quantity': The updated quantity of the stock in the portfolio.

    Raises:
        401: If the user is not logged in.
        404: If the stock details are not found.
    """
    data = request.json
    symbol = data.get('SYMBOL')
    added_quantity = data.get('QUANTITY')
    user_id = session.get('USER_ID')

    fetch_stock_details = lambda symbol: requests.get(
        f'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    ).json().get('bestMatches')[0].get('2. name')

    if not user_id:
        return jsonify({'message': 'User is not logged in.'}), 401

    stock = Stock.query.filter_by(SYMBOL=symbol).first()
    if not stock:
        stock_name = fetch_stock_details(symbol)
        if not stock_name:
            return jsonify({'message': 'Stock details not found'}), 404

        stock = Stock(SYMBOL=symbol, NAME=stock_name)
        db.session.add(stock)
        db.session.commit()

    portfolio = Portfolio.query.filter_by(USER_ID=user_id).first()
    if not portfolio:
        portfolio = Portfolio(USER_ID=user_id)
        db.session.add(portfolio)
        db.session.commit()

    portfolio_stock = PortfolioStock.query.filter_by(
        PORTFOLIO_ID=portfolio.PORTFOLIO_ID,
        STOCK_ID=stock.STOCK_ID
    ).first()

    if portfolio_stock:
        portfolio_stock.QUANTITY += added_quantity
    else:
        portfolio_stock = PortfolioStock(
            PORTFOLIO_ID=portfolio.PORTFOLIO_ID,
            STOCK_ID=stock.STOCK_ID,
            QUANTITY=added_quantity,
            ACQUISITION_PRICE=data.get('ACQUISITION_PRICE'),
            ACQUISITION_DATE= datetime.datetime.now()
        )
        db.session.add(portfolio_stock)

    db.session.commit()

    return jsonify({
        'message': 'Stock quantity updated in portfolio',
        'updated_quantity': portfolio_stock.QUANTITY
    }), 200

@app.route('/api/portfolio/remove', methods=['POST'])
def remove_stock_from_portfolio():
    data = request.json
    symbol = data.get('SYMBOL')
    user_id = session.get('USER_ID')

    if not user_id:
        return jsonify({'message': 'User is not logged in.'}), 401

    stock = Stock.query.filter_by(SYMBOL=symbol).first()
    if not stock:
        return jsonify({'message': 'Stock not found'}), 404

    portfolio = Portfolio.query.filter_by(USER_ID=user_id).first()
    if not portfolio:
        return jsonify({'message': 'Portfolio not found'}), 404

    portfolio_stock = PortfolioStock.query.filter_by(
        PORTFOLIO_ID=portfolio.PORTFOLIO_ID,
        STOCK_ID=stock.STOCK_ID
    ).first()

    if not portfolio_stock:
        return jsonify({'message': 'Stock not found in portfolio'}), 404
    
    if portfolio_stock.QUANTITY > 0:
        portfolio_stock.QUANTITY -= 1 
        message = 'The stock quantity was successfully updated in the portfolio'
    else:
        db.session.delete(portfolio_stock)
        message = 'The stock was succesfully removed from the portfolio'

        
    if portfolio_stock.QUANTITY == 0:
        db.session.delete(portfolio_stock)
        message = 'The stock was succesfully removed from the portfolio'

    db.session.commit()

    return jsonify({
        'message': message,
        'updated_quantity': portfolio_stock.QUANTITY if portfolio_stock.QUANTITY > 0 else 0
    }), 200

@app.route('/api/portfolio', methods=['GET'])
def view_portfolio():
    user_id = session.get('USER_ID')
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    portfolio = Portfolio.query.filter_by(USER_ID=user_id).first()
    if not portfolio:
        return jsonify({"error": "Portfolio not found"}), 404

    portfolio_stocks = PortfolioStock.query.filter_by(PORTFOLIO_ID=portfolio.PORTFOLIO_ID).all()
    stocks_details = []
    total_current_value = 0

    for ps in portfolio_stocks:
        stock = Stock.query.filter_by(STOCK_ID=ps.STOCK_ID).first()
        if stock:
            response = requests.get(
                f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={stock.SYMBOL}&apikey={ALPHA_VANTAGE_API_KEY}"
            )
            response_json = response.json()
            try:
                current_price = float(response_json["Global Quote"]["05. price"])
            except KeyError:
                current_price = None
                app.logger.error(f"Could not fetch current price for {stock.SYMBOL}")

            if current_price is not None:
                current_value = current_price * ps.QUANTITY
                total_current_value += current_value
            else:
                current_value = None

            stock_detail = {
                'STOCK_ID': ps.STOCK_ID,
                "SYMBOL": stock.SYMBOL,
                "NAME": stock.NAME,
                "QUANTITY": ps.QUANTITY,
                "ACQUISITION_PRICE": ps.ACQUISITION_PRICE,
                "ACQUISITION_DATE": ps.ACQUISITION_DATE,
                "CURRENT_PRICE": current_price,
                "CURRENT_VALUE": current_value
            }
            stocks_details.append(stock_detail)
        else:
            app.logger.error(f"Stock with ID {ps.STOCK_ID} not found in the STOCK table")

    return jsonify({"stocks": stocks_details, "total_current_value": total_current_value}), 200


@app.route('/api/portfolio/create', methods=['POST'])
def create_portfolio():
    user_id = session.get('USER_ID')
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    portfolio = Portfolio.query.filter_by(USER_ID=user_id).first()
    if portfolio:
        return jsonify({"error": "Portfolio already exists"}), 409

    new_portfolio_id = db.session.execute(Sequence('portfolio_id_seq')).scalar()
    new_portfolio = Portfolio(USER_ID=user_id)
    new_portfolio.PORTFOLIO_ID = new_portfolio_id
    db.session.add(new_portfolio)
    db.session.commit()


    return jsonify({"message": "Portfolio created successfully"}), 201


@app.route('/api/all-stocks/')
def all_stocks():
    url = f'https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={ALPHA_VANTAGE_API_KEY}'

    try:
        response = requests.get(url)
        if response.status_code == 200:
            return Response(response.content, content_type='text/csv')
        else:
            logging.error(f"Error fetching data from Alpha Vantage: HTTP {response.status_code}")
            return jsonify({"error": "Failed to fetch data from Alpha Vantage"}), response.status_code
    except requests.RequestException as e:
        print(f"Request to Alpha Vantage failed: {e}")
        return jsonify({"error": "Failed to connect to Alpha Vantage"}), 500


@app.route('/api/stock/<symbol>')
def stock_data(symbol):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    return jsonify(response.json())


@app.route('/api/quote/<symbol>')
def stock_quote(symbol):
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    return jsonify(response.json())


if __name__ == '__main__':
    app.run(debug=False)
