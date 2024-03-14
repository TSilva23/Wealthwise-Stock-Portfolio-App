from flask import Flask, jsonify, Response, request, session
from flask_cors import CORS
import requests
import os
import csv
import io
import logging
from datetime import datetime
from models import db, User, Stock, Portfolio, PortfolioStock
from sqlalchemy.pool import NullPool
import oracledb

app = Flask(__name__)
CORS(app, supports_credentials=True)
ALPHA_VANTAGE_API_KEY = ('ZBD3QIPITMQNSPPF')

un = 'myownsh'
pw = 'AaZZ0r_cle#1'
dsn = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=g94a0d92b10bb94_p1plm1xfn2614jm8_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'

pool = oracledb.create_pool(user=un, password=pw,
                            dsn=dsn)

app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = 'mysecretkey'
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(name=username).first()
        print(user)

        if user and user.check_password(password):
            session['user_id'] = user.user_id
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'message': 'Invalid username or password'}), 401
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({'message': 'An error occurred'}), 500

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        username = data.get('NAME')
        password = data.get('PASSWORD_HASH')

        existing_user = User.query.filter_by(NAME=username).first()
        if existing_user:
            return jsonify({'message': 'User already exists'}), 409

        new_user = User(NAME=username)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({'message': 'An error occurred'}), 500

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/portfolio/add', methods=['POST'])
def add_stock_to_portfolio():
    try:
        data = request.json
        user_id = data.get('USERID')
        symbol = data.get('SYMBOL')
        quantity = data.get('QUANTITY')
        acquisition_price = data.get('ACQUISITIONPRICE')
        acquisition_date = datetime.strptime(data.get('ACQUISITIONDATE'), '%Y-%m-%d')

        user = User.query.filter_by(USER_ID=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        stock = Stock.query.filter_by(SYMBOL=symbol).first()
        if not stock:
            return jsonify({"error": "Stock not found"}), 404

        portfolio = Portfolio.query.filter_by(USER_ID=user_id).first()
        if not portfolio:
            portfolio = Portfolio(USER_ID=user_id)
            db.session.add(portfolio)
            db.session.commit()

        portfolio_stock = PortfolioStock(
            PORTFOLIO_ID=portfolio.PORTFOLIO_ID,
            STOCK_ID=stock.STOCK_ID,
            QUANTITY=quantity,
            ACQUISITION_PRICE=acquisition_price,
            ACQUISITION_DATE=acquisition_date
        )
        db.session.add(portfolio_stock)
        db.session.commit()

        return jsonify({"message": "Stock successfully added to portfolio"}), 200
    except Exception as e:
        db.session.rollback()  # Roll back the session in case of error
        return jsonify({"error": str(e)}), 500


@app.route('/api/portfolio/<int:user_id>', methods=['GET'])
def view_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(USER_ID=user_id).first()
    if not portfolio:
        return jsonify({"error": "Portfolio not found"}), 404
    
    portfolio_stocks = PortfolioStock.query.filter_by(PORTFOLIO_ID=portfolio.PORTFOLIO_ID).all()
    stocks_details = []
    for ps in portfolio_stocks:
        stock = Stock.query.filter_by(STOCK_ID=ps.STOCK_ID).first()
        stock_detail = {
            "symbol": stock.SYMBOL,
            "name": stock.NAME,
            "quantity": ps.QUANTITY,
            "acquisition_price": ps.ACQUISITION_PRICE,
            "acquisition_date": ps.ACQUISITION_DATE.strftime('%Y-%m-%d')
        }
        stocks_details.append(stock_detail)

    return jsonify(stocks_details), 200

@app.route('/api/all-stocks')
def all_stocks():
    url = f'https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={ALPHA_VANTAGE_API_KEY}'
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            # Directly pass through the CSV content with the correct content-type
            return Response(response.content, content_type='text/csv')
        else:
            # Log the error or handle it as appropriate for your application
            logging.error(f"Error fetching data from Alpha Vantage: HTTP {response.status_code}")
            return jsonify({"error": "Failed to fetch data from Alpha Vantage"}), response.status_code
    except requests.RequestException as e:
        # Handle connection-related errors
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
