from flask import Flask, jsonify, Response
from flask_cors import CORS
import requests
import os
import csv
import io
import logging

app = Flask(__name__)
CORS(app)

ALPHA_VANTAGE_API_KEY = ('ZBD3QIPITMQNSPPF')

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
