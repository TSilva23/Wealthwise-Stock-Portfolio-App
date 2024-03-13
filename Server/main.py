from flask import Flask, jsonify, Response
from flask_cors import CORS
import requests
import os
import csv
import io
import logging
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify
import jwt
import datetime
from flask import request

app = Flask(__name__)
CORS(app)

ALPHA_VANTAGE_API_KEY = ('ZBD3QIPITMQNSPPF')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy()

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    stock_symbol = db.Column(db.String(10), nullable=False)

    def dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_symbol': self.stock_symbol
        }
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@app.route('/portfolio/<int:user_id>', methods=['GET'])
def get_portfolio(user_id):
    portfolio_items = Portfolio.query.filter_by(user_id=user_id).all()
    return jsonify([item.dict() for item in portfolio_items])

@app.route('/portfolio/add', methods=['POST'])
def add_to_portfolio():
    user_id = request.json.get('user_id')
    stock_symbol = request.json.get('stock_symbol')
    new_stock = Portfolio(user_id=user_id, stock_symbol=stock_symbol)
    db.session.add(new_stock)
    db.session.commit()
    return jsonify({"message": "Stock added to portfolio"}), 201

@app.route('/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        token = jwt.encode({
            'user_id': user.id,
            'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token})
    return jsonify({'error': 'Invalid username or password'}), 401


@app.route('/register', methods=['POST'])
def register():
    username = request.json['username']
    password = request.json['password']
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

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
    app.run(debug=True)
