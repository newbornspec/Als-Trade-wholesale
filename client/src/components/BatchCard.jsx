import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import './BatchCard.css';

export default function BatchCard({ batch }) {
  const { user } = useAuth();

  const categoryIcon = {
    laptops: '💻', phones: '📱', tablets: '📲', mixed: '📦', other: '📦',
  }[batch.category] || '📦';

  return (
    <div className="batch-card">
      {/* Image */}
      <div className="card-image">
        {batch.images?.[0] ? (
          <img src={getImageUrl(batch.images[0])} alt={batch.title} />
        ) : (
          <div className="card-image-placeholder">
            <span>{categoryIcon}</span>
          </div>
        )}
        <span className={`card-status ${batch.status === 'sold' ? 'sold' : 'available'}`}>
          {batch.status === 'sold' ? 'Sold' : 'For sale'}
        </span>
      </div>

      {/* Body */}
      <div className="card-body">
        <p className="card-batch-num">Batch #{batch.batchNumber}</p>
        <h3 className="card-title">{batch.title}</h3>

        {batch.specs && (
          <p className="card-specs">{batch.specs}</p>
        )}

        <div className="card-meta">
          {batch.tested !== undefined && (
            <span className={`badge ${batch.tested ? 'badge-green' : 'badge-amber'}`}>
              {batch.tested ? 'Tested' : 'Untested'}
            </span>
          )}
          {!batch.hasList && (
            <span className="badge badge-red">No list</span>
          )}
          {batch.grade && (
            <span className="badge badge-amber">Grade {batch.grade}</span>
          )}
        </div>

        <div className="card-footer">
          <div className="card-price">
            {user ? (
              batch.price != null ? (
                <>
                  <span className="price-label">Price</span>
                  <span className="price-value">
                    £ {batch.price.toLocaleString('en-GB')}
                  </span>
                </>
              ) : (
                <span className="price-on-request">Price on request</span>
              )
            ) : (
              <Link to="/sign-in" className="price-login">
                Login to see price →
              </Link>
            )}
          </div>

          <Link
            to={`/available-stock/${batch.slug}`}
            className="card-cta"
          >
            More info
          </Link>
        </div>
      </div>
    </div>
  );
}
