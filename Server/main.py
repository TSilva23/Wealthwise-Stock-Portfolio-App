from flask import Flask, jsonify, Response
from flask_cors import CORS
import requests
import os
import csv
import io

app = Flask(__name__)
CORS(app)

ALPHA_VANTAGE_API_KEY = os.getenv('ZBD3QIPITMQNSPPF')

@app.route('/api/all-stocks')
def all_stocks():
    url = f'https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch data"}), response.status_code
    
    reader = csv.DictReader(io.StringIO(response.text))
    stocks = [row for row in reader]  # Convert CSV to list of dicts
    
    return jsonify(stocks)  # Return as JSON

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
