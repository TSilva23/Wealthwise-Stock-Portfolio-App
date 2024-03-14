from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Sequence

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'USERS'  # Table names are typically uppercase in Oracle
    USER_ID = db.Column(db.Integer, Sequence('user_id_seq'), primary_key=True)
    NAME = db.Column(db.String(100), nullable=False)
    EMAIL = db.Column(db.String(100), unique=True, nullable=False)
    PASSWORD_HASH = db.Column(db.String(256), nullable=False)
    CREATED_AT = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    UPDATED_AT = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to Portfolio
    portfolios = db.relationship('Portfolio', backref='user', lazy=True)  # Backref should be to the class attribute

class Stock(db.Model):
    __tablename__ = 'STOCK'
    STOCK_ID = db.Column(db.Integer, primary_key=True)
    SYMBOL = db.Column(db.String(20), unique=True, nullable=False)
    NAME = db.Column(db.String(100), nullable=False)
    
    # Relationship to PortfolioStock
    portfolio_stocks = db.relationship('PortfolioStock', backref='stock', lazy=True)

class Portfolio(db.Model):
    __tablename__ = 'PORTFOLIO'
    PORTFOLIO_ID = db.Column(db.Integer, primary_key=True)
    USER_ID = db.Column(db.Integer, db.ForeignKey('USERS.USER_ID'), nullable=False)  # Corrected ForeignKey reference
    CREATED_AT = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    UPDATED_AT = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to PortfolioStock
    portfolio_stocks = db.relationship('PortfolioStock', backref='portfolio', lazy=True)

class PortfolioStock(db.Model):
    __tablename__ = 'PORTFOLIO_STOCKS'
    PORTFOLIO_STOCK_ID = db.Column(db.Integer, primary_key=True)
    PORTFOLIO_ID = db.Column(db.Integer, db.ForeignKey('PORTFOLIO.PORTFOLIO_ID'), nullable=False)  # Corrected ForeignKey reference
    STOCK_ID = db.Column(db.Integer, db.ForeignKey('STOCK.STOCK_ID'), nullable=False)  # Corrected ForeignKey reference
    QUANTITY = db.Column(db.Integer, nullable=False)
    ACQUISITION_PRICE = db.Column(db.Float, nullable=False)
    ACQUISITION_DATE = db.Column(db.DateTime, nullable=False)
