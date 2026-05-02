import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/shop/ProductCard';
import { fetchGlasses } from '../../services/api';
import { getRecommendedGlassesShapes } from '../../utils/faceGeometry';

const RecommendedProducts = ({ faceShape, onTryOnClick }) => {
  const [recommendationGroups, setRecommendationGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!faceShape || faceShape === 'Waiting...') {
      setRecommendationGroups([]);
      return;
    }

    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const groups = getRecommendedGlassesShapes(faceShape);
        
        const results = await Promise.all(
          groups.map(async (group) => {
            const rowResults = await Promise.all(
              group.recs.ids.map(async (id, index) => {
                const response = await fetchGlasses({ 
                  glassesShapeId: id,
                  items: 12 
                });
                return {
                  shapeId: id,
                  shapeName: group.recs.names[index],
                  products: response.data || []
                };
              })
            );
            return {
              groupTitle: group.title,
              rows: rowResults.filter(r => r.products.length > 0)
            };
          })
        );

        setRecommendationGroups(results.filter(g => g.rows.length > 0));
      } catch (error) {
        console.error("Error loading recommended glasses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [faceShape]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '10px', color: '#94a3b8' }}>Finding perfect frames for your {faceShape} face...</p>
      </div>
    );
  }

  if (recommendationGroups.length === 0 && faceShape !== 'Waiting...') {
    return null;
  }

  const handleTypeClick = (shapeId) => {
    navigate(`/store?glassesShapeId=${shapeId}`);
  };

  return (
    <div className="recommended-section" style={{ marginTop: '50px', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ 
          fontSize: '2.8rem', 
          marginBottom: '10px',
          color: '#fff',
          textShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
        }}>
          Recommended glasses for <span style={{ color: '#818cf8', textTransform: 'capitalize' }}>{faceShape}</span> face
        </h2>
      </div>

      {recommendationGroups.map((group, groupIdx) => (
        <div key={groupIdx} style={{ marginBottom: '80px' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
            paddingBottom: '15px'
          }}>
            <h3 style={{ color: '#818cf8', fontSize: '1.8rem', margin: 0, letterSpacing: '1px' }}>
              {group.groupTitle}
            </h3>
          </div>

          {group.rows.map((row) => (
            <div key={row.shapeId} className="recommendation-row" style={{ marginBottom: '50px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 24px',
                marginBottom: '20px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)',
                borderLeft: '4px solid #6366f1'
              }}>
                <h4 
                  onClick={() => handleTypeClick(row.shapeId)}
                  style={{ 
                    color: '#fff', 
                    fontSize: '1.4rem', 
                    margin: 0,
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#818cf8'}
                  onMouseLeave={(e) => e.target.style.color = '#fff'}
                >
                  {row.shapeName} Collection
                </h4>
                <span 
                  onClick={() => handleTypeClick(row.shapeId)}
                  style={{ 
                    color: '#6366f1', 
                    cursor: 'pointer', 
                    fontSize: '0.9rem', 
                    fontWeight: 'bold',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.1)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                >
                  View all →
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '30px', 
                padding: '10px 20px'
              }}>
                {row.products.slice(0, 3).map(item => (
                  <div key={item.id} style={{ flex: '0 0 300px' }}>
                    <ProductCard 
                      item={item} 
                      onTryOnClick={() => onTryOnClick(item.id)} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RecommendedProducts;
